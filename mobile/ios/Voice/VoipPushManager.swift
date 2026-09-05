import CallKit
import Foundation
import os
import PushKit

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
    var dictionary: [String: Any] = [
      "roomId": roomId,
      "callId": callId,
      "callerUserId": callerUserId,
      "callerEmail": callerEmail,
    ]
    if let callerName {
      dictionary["callerName"] = callerName
    }
    return dictionary
  }
}

/// @objc is so the React Native iOS module can read shared, currentToken, and accepted-call methods.
/// the swift compiler creates Voice-Swift.h at compile time and writes those @objc declarations into it
/// VoipPush.m imports that header.
@objc(VoipPushManager)
final class VoipPushManager: NSObject, PKPushRegistryDelegate, CXProviderDelegate {
  @objc static let shared = VoipPushManager()

  private var voipRegistry: PKPushRegistry?
  @objc private(set) var currentToken: String?
  // callkit's handle to the system incoming-call ui. we report calls on it;
  // it calls us back (answer, end, reset) via CXProviderDelegate.
  private let telephonyProvider: CXProvider
  private var pendingCalls: [UUID: IncomingCallInfo] = [:]
  private var acceptedCallInfo: IncomingCallInfo?
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

    let dictionary = payload.dictionaryPayload
    let incomingCallInfo = parseIncomingCall(from: dictionary)
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

      log.info("VOICEDEBUG CallKit incoming call reported")
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
  func providerDidReset(_: CXProvider) {
    pendingAnswerAction?.fail()
    pendingAnswerAction = nil
    acceptedCallInfo = nil
    pendingCalls.removeAll()
    log.info("VOICEDEBUG CallKit provider reset")
  }

  func provider(_: CXProvider, perform action: CXAnswerCallAction) {
    acceptedCallInfo = pendingCalls[action.callUUID]
    pendingCalls.removeValue(forKey: action.callUUID)
    guard let acceptedCallInfo else {
      log.error("VOICEDEBUG CallKit answer missing pending call")
      action.fail()
      return
    }

    pendingAnswerAction = action
    log.info("VOICEDEBUG CallKit answer held callId=\(acceptedCallInfo.callId, privacy: .public)")
  }

  func provider(_: CXProvider, perform action: CXEndCallAction) {
    if pendingAnswerAction?.callUUID == action.callUUID {
      pendingAnswerAction?.fail()
      pendingAnswerAction = nil
    }
    if acceptedCallInfo?.uuid == action.callUUID {
      acceptedCallInfo = nil
    }
    pendingCalls.removeValue(forKey: action.callUUID)
    log.info("VOICEDEBUG CallKit end (stub)")
    action.fulfill()
  }

  /// this is the way for js to reach for acceptedCallInfo
  /// (if RN was down when we stroke an event an it missed it)
  @objc func takeAcceptedCallInfo() -> [String: Any]? {
    guard let acceptedCallInfo else { return nil }
    self.acceptedCallInfo = nil
    return acceptedCallInfo.asDictionary
  }

  /// this is the way to fulfill when we want it (also from js)
  @objc func fulfillPendingAnswerAction() {
    guard let pendingAnswerAction else { return }
    log.info("VOICEDEBUG CallKit answer fulfilled")
    pendingAnswerAction.fulfill()
    self.pendingAnswerAction = nil
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
