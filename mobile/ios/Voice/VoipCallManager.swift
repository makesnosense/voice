import AVFoundation
import CallKit
import Foundation
import os
import PushKit
import WebRTC

private let log = Logger(
  subsystem: Bundle.main.bundleIdentifier ?? "voice",
  category: "PushKit"
)

private struct IncomingCallInfo {
  let uuid: UUID
  let roomId: String
  let callId: String
  let callerUserId: String
  let callerEmail: String
  let callerName: String?

  var callerDisplayName: String {
    if let callerName {
      return callerName
    }
    return callerEmail
  }

  var asDictionary: [String: Any] {
    [
      "roomId": roomId,
      "callId": callId,
      "callerUserId": callerUserId,
      "callerEmail": callerEmail,
      "callerName": callerName ?? NSNull(),
    ]
  }
}

/// Nofication.name is typical way to create a channel in NotificationCenter
/// NotificationCenter is in-process Pub/Sub
extension Notification.Name {
  /// in-process only — not a user/push notification. objc will observe this string later.
  static let voipCallAccepted = Notification.Name("VoipCallAccepted")
  static let voipCallEnded = Notification.Name("VoipCallEnded")
}

/// @objc is so the React Native iOS module can read shared, currentToken, and accepted-call methods.
/// the swift compiler creates Voice-Swift.h at compile time and writes those @objc declarations into it
/// VoipPushToken.m imports that header.
@objc(VoipCallManager)
final class VoipCallManager: NSObject, PKPushRegistryDelegate, CXProviderDelegate {
  @objc static let shared = VoipCallManager()

  private var voipRegistry: PKPushRegistry?
  @objc private(set) var currentToken: String?
  /// callkit's handle to the system incoming-call ui. we report calls on it;
  /// it calls us back (answer, end, reset) via CXProviderDelegate.
  private let telephonyProvider: CXProvider
  // we request actions on this (js hangup → CXEndCallAction). provider only receives.
  private let callController = CXCallController()
  private var pendingCalls: [UUID: IncomingCallInfo] = [:]
  // our callId (if callInfo parse doesn't fail), held as UUID because callkit wants that type.
  // pendingCalls / storedAcceptedCallInfo go away on answer; this stays until end/reset.
  private var activeCallUUID: UUID?
  private var storedAcceptedCallInfo: IncomingCallInfo?
  // held until we fulfill or fail — not fulfilling tells callkit the call is still connecting
  private var pendingAnswerAction: CXAnswerCallAction?

  override private init() {
    let configuration = CXProviderConfiguration()
    configuration.supportsVideo = false
    configuration.maximumCallGroups = 1
    configuration.maximumCallsPerCallGroup = 1
    configuration.supportedHandleTypes = [.generic]

    telephonyProvider = CXProvider(configuration: configuration)
    super.init()
    telephonyProvider.setDelegate(self, queue: nil)
  }

  func registerForVoIPPushes() {
    if voipRegistry != nil {
      return
    }

    voipRegistry = PKPushRegistry(queue: .main)
    guard let voipRegistry else { return }
    voipRegistry.delegate = self
    voipRegistry.desiredPushTypes = [.voIP]
  }

  func pushRegistry(
    _: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    guard type == .voIP else { return }
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    currentToken = token
    log.info("VOICEDEBUG VoIP token: \(token, privacy: .public)")
  }

  func pushRegistry(_: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    guard type == .voIP else { return }
    currentToken = nil
    log.info("VOICEDEBUG VoIP token invalidated")
  }

  /// apple requires reportNewIncomingCall before this method returns. skip that and
  /// ios kills the app; repeat it and voip pushes stop until the app is reinstalled.
  func pushRegistry(
    _: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    guard type == .voIP else {
      completion()
      return
    }

    log.info("VOICEDEBUG VoIP push received")

    let voipPayloadDictionary = payload.dictionaryPayload
    let pushType = trimmedString(voipPayloadDictionary["type"])
    if pushType == "call_declined" || pushType == "call_cancelled" {
      handleCallDeclinedOrCancelledFromRemotePush(voipPayloadDictionary, completion: completion)
      return
    }

    let incomingCallInfo = parseIncomingCall(from: voipPayloadDictionary)
    let callUUID = incomingCallInfo?.uuid ?? UUID()

    if let incomingCallInfo {
      pendingCalls[incomingCallInfo.uuid] = incomingCallInfo
      log.info(
        "VOICEDEBUG parsed call uuid=\(incomingCallInfo.uuid.uuidString, privacy: .public) roomId=\(incomingCallInfo.roomId, privacy: .public) callId=\(incomingCallInfo.callId, privacy: .public)"
      )
    } else {
      log.error("VOICEDEBUG VoIP payload missing required fields, reporting fallback call")
    }

    let update = CXCallUpdate()
    let callerDisplayName = incomingCallInfo?.callerDisplayName ?? "Incoming call"
    update.remoteHandle = CXHandle(type: .generic, value: callerDisplayName)
    update.localizedCallerName = callerDisplayName
    update.hasVideo = false
    update.supportsHolding = false
    update.supportsGrouping = false
    update.supportsUngrouping = false
    update.supportsDTMF = false

    func onIncomingCallReportFinished(error: Error?) {
      if let error {
        pendingCalls.removeValue(forKey: callUUID)
        log.error("VOICEDEBUG CallKit report failed: \(error.localizedDescription, privacy: .public)")
        completion()
        return
      }

      activeCallUUID = callUUID
      log.info(
        "VOICEDEBUG CallKit incoming call reported uuid=\(callUUID.uuidString, privacy: .public)"
      )
      completion()
    }

    telephonyProvider.reportNewIncomingCall(
      with: callUUID,
      update: update,
      completion: onIncomingCallReportFinished
    )
  }

  /// callkit discarded every call it knew about (out of sync, leftover state).
  /// not a voIP token change — that is didInvalidatePushTokenFor.
  /// first argument is telephonyProvider. iOS calls this on it automatically (setDelegate queue: nil → main).
  func providerDidReset(_: CXProvider) {
    pendingAnswerAction?.fail()
    pendingAnswerAction = nil
    storedAcceptedCallInfo = nil
    pendingCalls.removeAll()
    activeCallUUID = nil
    log.info("VOICEDEBUG CallKit provider reset")
  }

  /// first argument is telephonyProvider. iOS calls this on it automatically.
  func provider(_: CXProvider, perform action: CXAnswerCallAction) {
    storedAcceptedCallInfo = pendingCalls[action.callUUID]
    pendingCalls.removeValue(forKey: action.callUUID)
    guard let storedAcceptedCallInfo else {
      log.error("VOICEDEBUG CallKit answer missing pending call")
      action.fail()
      return
    }

    // WebRTC’s singleton wrapper around system audio session.
    // One process-wide instance.
    let rtcAudioSession = RTCAudioSession.sharedInstance()

    // by default webrtc starts its audio unit as soon as a track is ready
    // (getUserMedia) — before callkit has handed over the session. this flag
    // defers that: the unit only starts once isAudioEnabled is also true,
    // which we set in didActivate.
    rtcAudioSession.useManualAudio = true
    do {
      try AVAudioSession.sharedInstance().setCategory(
        AVAudioSession.Category.playAndRecord,
        mode: AVAudioSession.Mode.voiceChat,
        options: [AVAudioSession.CategoryOptions.allowBluetooth]
      )
    } catch {
      log.error(
        "VOICEDEBUG audio session category failed: \(error.localizedDescription, privacy: .public)"
      )
    }

    pendingAnswerAction = action
    log.info("VOICEDEBUG CallKit answer held callId=\(storedAcceptedCallInfo.callId, privacy: .public)")

    // NotificationCenter is Apple’s in-process pub/sub. Same app, same process.
    // It is NOT push notifications, NOT CallKit, NOT UNUserNotificationCenter (banners).
    NotificationCenter.default.post(
      name: Notification.Name.voipCallAccepted,
      object: nil,
      userInfo: storedAcceptedCallInfo.asDictionary
    )
  }

  /// first argument is telephonyProvider. iOS calls this on it automatically.
  func provider(_: CXProvider, perform action: CXEndCallAction) {
    if pendingAnswerAction?.callUUID == action.callUUID {
      pendingAnswerAction?.fail()
      pendingAnswerAction = nil
    }
    if storedAcceptedCallInfo?.uuid == action.callUUID {
      storedAcceptedCallInfo = nil
    }
    pendingCalls.removeValue(forKey: action.callUUID)
    if activeCallUUID == action.callUUID {
      activeCallUUID = nil
    }
    NotificationCenter.default.post(name: Notification.Name.voipCallEnded, object: nil)
    log.info("VOICEDEBUG CallKit end")
    action.fulfill()
  }

  /// callkit calls this after it activates avaudiosession (after fulfill).
  /// we hand that session to webrtc.
  func provider(_: CXProvider, didActivate audioSession: AVAudioSession) {
    let rtcAudioSession = RTCAudioSession.sharedInstance()
    rtcAudioSession.audioSessionDidActivate(audioSession)
    rtcAudioSession.isAudioEnabled = true
    log.info("VOICEDEBUG CallKit audio session activated")
  }

  /// callkit calls this after it deactivates the session (end, fail, or interruption). we stop webrtc's audio unit.
  func provider(_: CXProvider, didDeactivate audioSession: AVAudioSession) {
    let rtcAudioSession = RTCAudioSession.sharedInstance()
    rtcAudioSession.audioSessionDidDeactivate(audioSession)
    rtcAudioSession.isAudioEnabled = false
    rtcAudioSession.useManualAudio = false
    log.info("VOICEDEBUG CallKit audio session deactivated")
  }

  /// this is the way for js to reach for storedAcceptedCallInfo
  /// (if RN was down when we stroke an event an it missed it)
  @objc func takeStoredAcceptedCallInfo() -> [String: Any]? {
    guard let storedAcceptedCallInfo else { return nil }
    self.storedAcceptedCallInfo = nil
    return storedAcceptedCallInfo.asDictionary
  }

  /// this is the way to fulfill when we want it (also from js)
  /// until we send it, iOS keeps the banner on Connecting.
  /// after we send it, iOS shows the in-call UI,
  /// CallKit treats the call as connected and activates AVAudioSession and calls didActivate
  @objc func fulfillPendingAnswerAction() {
    guard let pendingAnswerAction else { return }
    log.info("VOICEDEBUG CallKit answer fulfilled")
    pendingAnswerAction.fulfill()
    self.pendingAnswerAction = nil
  }

  /// js requests a CXEndCallAction through CXCallController
  /// (same path as the system End button). no-op if there is no active callkit call.
  @objc func requestIosEndCallKitCall() {
    guard let activeCallUUID else { return }
    let endAction = CXEndCallAction(call: activeCallUUID)
    let endActionTransaction = CXTransaction(action: endAction)
    callController.request(endActionTransaction) { error in
      if let error {
        log.error(
          "VOICEDEBUG CallKit end request failed: \(error.localizedDescription, privacy: .public)"
        )
      }
    }
  }

  private func handleCallDeclinedOrCancelledFromRemotePush(
    _ voipPayloadDictionary: [AnyHashable: Any],
    completion: @escaping () -> Void
  ) {
    let callUUID = uuidFromPushPayload(voipPayloadDictionary)
    if !isRinging(uuid: callUUID) {
      handleUnexpectedRemoteEndWhileNotRinging(uuid: callUUID, completion: completion)
      return
    }

    log.info("VOICEDEBUG VoIP remote end uuid=\(callUUID.uuidString, privacy: .public)")

    // drop ringing state first so CXEndCallAction from this end does not POST /decline
    pendingCalls.removeValue(forKey: callUUID)

    /// apple still requires reportNewIncomingCall for this voip. if the uuid is
    /// already ringing, that report fails (duplicate) and we just end the existing call.
    func onCallDeclinedOrCancelledFromRemoteReportFinished(error: Error?) {
      telephonyProvider.reportCall(
        with: callUUID,
        endedAt: Date(),
        reason: CXCallEndedReason.remoteEnded
      )
      clearCallState(callUUID)
      if let error {
        log.info(
          "VOICEDEBUG CallKit remote-end report: \(error.localizedDescription, privacy: .public)"
        )
      }
      completion()
    }

    reportDummyIncomingCallToSatisfyPushKit(
      uuid: callUUID,
      completion: onCallDeclinedOrCancelledFromRemoteReportFinished
    )
  }

  /// room join excludes this device's voip token, so this push should not arrive while
  /// we are not ringing. still must reportNewIncomingCall or apple kills voip.
  /// duplicate = already in callkit (answered) — do not end.
  /// success = ghost incoming we just created → end it.
  private func handleUnexpectedRemoteEndWhileNotRinging(
    uuid: UUID,
    completion: @escaping () -> Void
  ) {
    log.error(
      "VOICEDEBUG unexpected remote-end voip while not ringing uuid=\(uuid.uuidString, privacy: .public)"
    )

    func onUnexpectedRemoteEndReportFinished(error: Error?) {
      if error == nil {
        telephonyProvider.reportCall(
          with: uuid,
          endedAt: Date(),
          reason: CXCallEndedReason.remoteEnded
        )
      }
      completion()
    }

    reportDummyIncomingCallToSatisfyPushKit(
      uuid: uuid,
      completion: onUnexpectedRemoteEndReportFinished
    )
  }

  private func reportDummyIncomingCallToSatisfyPushKit(uuid: UUID, completion: @escaping (Error?) -> Void) {
    let update = CXCallUpdate()
    update.hasVideo = false
    update.supportsHolding = false
    update.supportsGrouping = false
    update.supportsUngrouping = false
    update.supportsDTMF = false
    telephonyProvider.reportNewIncomingCall(with: uuid, update: update, completion: completion)
  }

  private func isRinging(uuid: UUID) -> Bool {
    pendingCalls[uuid] != nil
  }

  private func uuidFromPushPayload(_ voipPayloadDictionary: [AnyHashable: Any]) -> UUID {
    let uuidString = trimmedString(voipPayloadDictionary["uuid"]) ?? trimmedString(voipPayloadDictionary["callId"])
    return uuidString.flatMap { UUID(uuidString: $0) } ?? UUID()
  }

  private func clearCallState(_ uuid: UUID) {
    pendingCalls.removeValue(forKey: uuid)
    if pendingAnswerAction?.callUUID == uuid {
      pendingAnswerAction?.fail()
      pendingAnswerAction = nil
    }
    if storedAcceptedCallInfo?.uuid == uuid {
      storedAcceptedCallInfo = nil
    }
    if activeCallUUID == uuid {
      activeCallUUID = nil
    }
  }

  private func parseIncomingCall(from payload: [AnyHashable: Any]) -> IncomingCallInfo? {
    guard
      let uuidString = trimmedString(payload["uuid"]) ?? trimmedString(payload["callId"]),
      let uuid = UUID(uuidString: uuidString),
      let roomId = trimmedString(payload["roomId"]),
      let callId = trimmedString(payload["callId"]),
      let callerUserId = trimmedString(payload["callerUserId"]),
      let callerEmail = trimmedString(payload["callerEmail"])
    else { return nil }

    return IncomingCallInfo(
      uuid: uuid,
      roomId: roomId,
      callId: callId,
      callerUserId: callerUserId,
      callerEmail: callerEmail,
      callerName: trimmedString(payload["callerName"])
    )
  }

  private func trimmedString(_ value: Any?) -> String? {
    guard let value = value as? String else { return nil }
    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }
}
