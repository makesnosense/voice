import Foundation
import PushKit

final class VoipPushManager: NSObject, PKPushRegistryDelegate {
  static let shared = VoipPushManager()

  private var voipRegistry: PKPushRegistry?

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
    print("📱 VoIP token: \(token)")
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    guard type == .voIP else { return }
    print("⚠️ VoIP token invalidated")
  }
}
