import Foundation
import os
import PushKit

private let log = Logger(
  subsystem: Bundle.main.bundleIdentifier ?? "voice",
  category: "PushKit"
)

// @objc is only so the React Native iOS module (Objective-C++) can read shared and currentToken
@objc(VoipPushManager)
final class VoipPushManager: NSObject, PKPushRegistryDelegate {
  @objc static let shared = VoipPushManager()

  private var voipRegistry: PKPushRegistry?
  @objc private(set) var currentToken: String?

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
}
