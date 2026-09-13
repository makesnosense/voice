import Foundation
import MMKV

/// process-wide tencent mmkv root. must match react-native-mmkv (Documents/mmkv).
enum AppMMKV {
  static func initialize() {
    let documentsPath = FileManager.default.urls(
      for: FileManager.SearchPathDirectory.documentDirectory,
      in: FileManager.SearchPathDomainMask.userDomainMask
    )[0]
    let rootPath = documentsPath.appendingPathComponent("mmkv", isDirectory: true).path
    MMKV.initialize(rootDir: rootPath)
  }
}

enum CallOutcome: String {
  case declined
  case cancelled
}

/// native writes; js drainDismissedCallLogsQueue reads. same mmap as android.
enum DismissedCallLogsQueue {
  private static let mmkvId = "dismissed-call-logs"
  private static let queueKey = "queue"

  static func enqueue(_ call: IncomingCallInfo, outcome: CallOutcome) {
    guard let mmkv = MMKV(mmapID: mmkvId, mode: MMKVMode.singleProcess) else {
      return
    }

    var queue: [[String: Any]] = []
    if let existing = mmkv.string(forKey: queueKey),
       let data = existing.data(using: String.Encoding.utf8),
       let parsed = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
    {
      queue = parsed
    }

    queue.append(
      [
        "callId": call.callId,
        "callerUserId": call.callerUserId,
        "callerEmail": call.callerEmail,
        "callerName": call.callerName ?? NSNull(),
        "createdAt": call.createdAt,
        "outcome": outcome.rawValue,
      ]
    )

    guard
      let data = try? JSONSerialization.data(withJSONObject: queue),
      let json = String(data: data, encoding: String.Encoding.utf8)
    else {
      return
    }

    mmkv.set(json, forKey: queueKey)
  }
}
