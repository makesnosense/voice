package org.voicepopuli.voice.incomingcall

import android.content.Intent

data class IncomingCallInfo(
    val callId: String,
    val callerUserId: String,
    val callerEmail: String,
    val callerName: String?,
    val createdAt: String,
    val roomId: String,
) {
    val callerDisplayName: String
        get() = callerName ?: callerEmail

    fun putExtraOn(intent: Intent) {
        intent.putExtra("roomId", roomId)
        intent.putExtra("callId", callId)
        intent.putExtra("callerUserId", callerUserId)
        intent.putExtra("callerEmail", callerEmail)
        intent.putExtra("callerName", callerName)
        intent.putExtra("createdAt", createdAt)
    }
}

fun incomingCallInfoFrom(intent: Intent): IncomingCallInfo? {
    val roomId = intent.getStringExtra("roomId") ?: return null
    val callId = intent.getStringExtra("callId") ?: return null
    val callerUserId = intent.getStringExtra("callerUserId") ?: return null
    val callerEmail = intent.getStringExtra("callerEmail") ?: return null
    val createdAt = intent.getStringExtra("createdAt") ?: return null
    return IncomingCallInfo(
        callId,
        callerUserId,
        callerEmail,
        intent.getStringExtra("callerName"),
        createdAt,
        roomId,
    )
}
