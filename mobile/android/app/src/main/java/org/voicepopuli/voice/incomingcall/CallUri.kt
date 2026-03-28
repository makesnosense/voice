package org.voicepopuli.voice.incomingcall

import android.net.Uri
import java.net.URLEncoder

fun buildCallUri(roomId: String?, callerUserId: String?, callerEmail: String?, callerName: String?): Uri {
    val base = "voice://call?roomId=$roomId&callerUserId=$callerUserId&callerEmail=${URLEncoder.encode(callerEmail, "UTF-8")}"
    val withName = if (callerName != null) "$base&callerName=${URLEncoder.encode(callerName, "UTF-8")}" else base
    return Uri.parse(withName)
}
