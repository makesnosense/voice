package org.voicepopuli.voice.incomingcall

import android.net.Uri
import java.net.URLEncoder

fun buildCallUri(
    roomId: String?,
    callerUserId: String?,
    callerEmail: String?,
    callerName: String?,
    callId: String?,
): Uri {
    var url =
        "voice://call" +
            "?roomId=$roomId" +
            "&callerUserId=$callerUserId" +
            "&callerEmail=${URLEncoder.encode(callerEmail, "UTF-8")}" +
            "&callId=$callId"
    if (callerName != null) url += "&callerName=${URLEncoder.encode(callerName, "UTF-8")}"
    return Uri.parse(url)
}
