import Foundation

@objc(ServerConfigIos)
final class ServerConfigIos: NSObject {
  @objc static let devHost = "admins-MacBook-Pro.local"
  @objc static let prodHost = "voice.k.vu"

  static var baseURL: String {
    #if DEBUG
      return "https://\(devHost):3003"
    #else
      return "https://\(prodHost)"
    #endif
  }
}
