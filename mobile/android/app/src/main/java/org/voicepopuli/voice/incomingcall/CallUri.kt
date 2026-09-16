package org.voicepopuli.voice.incomingcall

import android.net.Uri
import java.net.URLEncoder

fun buildCallUri(callInfo: IncomingCallInfo): Uri {
    var url =
        "voice://call" +
            "?roomId=${callInfo.roomId}" +
            "&callerUserId=${callInfo.callerUserId}" +
            "&callerEmail=${URLEncoder.encode(callInfo.callerEmail, "UTF-8")}" +
            "&callId=${callInfo.callId}"
    if (callInfo.callerName != null) url += "&callerName=${URLEncoder.encode(callInfo.callerName, "UTF-8")}"
    url += "&createdAt=${URLEncoder.encode(callInfo.createdAt, "UTF-8")}"
    return Uri.parse(url)
}
