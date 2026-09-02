import CallKit
import Foundation
import os
import PushKit

private let log = Logger(
  subsystem: Bundle.main.bundleIdentifier ?? "voice",
  category: "PushKit"
)

// @objc is only so the React Native iOS module (Objective-C++) can read shared and currentToken
@objc(VoipPushManager)
final class VoipPushManager: NSObject, PKPushRegistryDelegate, CXProviderDelegate {
  @objc static let shared = VoipPushManager()

  private var voipRegistry: PKPushRegistry?
  @objc private(set) var currentToken: String?
  private let telephonyProvider: CXProvider

  private override init() {
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
    if voipRegistry != nil { return }

    voipRegistry = PKPushRegistry(queue: .main)
    guard let voipRegistry else { return }
    voipRegistry.delegate = self
    voipRegistry.desiredPushTypes = [.voIP]
  }

  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    guard type == .voIP else { return }
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    currentToken = token
    log.info("VOICEDEBUG VoIP token: \(token, privacy: .public)")
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    guard type == .voIP else { return }
    currentToken = nil
    log.info("VOICEDEBUG VoIP token invalidated")
  }

  // apple requires reportNewIncomingCall before this method returns. skip that and
  // ios kills the app; repeat it and voip pushes stop until the app is reinstalled.
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    guard type == .voIP else {
      completion()
      return
    }

    log.info("VOICEDEBUG VoIP push received")

    let update = CXCallUpdate()
    let callerName = payload.dictionaryPayload["callerName"] as? String ?? "Incoming call"
    update.remoteHandle = CXHandle(type: .generic, value: callerName)
    update.localizedCallerName = callerName
    update.hasVideo = false
    update.supportsHolding = false
    update.supportsGrouping = false
    update.supportsUngrouping = false
    update.supportsDTMF = false

    func onCallReported(error: Error?) {
      if let error {
        log.error("VOICEDEBUG CallKit report failed: \(error.localizedDescription, privacy: .public)")
        completion()
        return
      }

      log.info("VOICEDEBUG CallKit incoming call reported")
      completion()
    }

    telephonyProvider.reportNewIncomingCall(
      with: UUID(),
      update: update,
      completion: onCallReported
    )
  }

  func providerDidReset(_ provider: CXProvider) {
    log.info("VOICEDEBUG CallKit provider reset")
  }

  func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    log.info("VOICEDEBUG CallKit answer (stub)")
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
    log.info("VOICEDEBUG CallKit end (stub)")
    action.fulfill()
  }
}
