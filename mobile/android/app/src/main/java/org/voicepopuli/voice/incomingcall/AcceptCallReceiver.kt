package org.voicepopuli.voice.incomingcall

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import org.voicepopuli.voice.MainActivity

class AcceptCallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        VoiceFirebaseMessagingService.cancelVibration()
        context.getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)

        val roomId = intent.getStringExtra("roomId")
        val callerUserId = intent.getStringExtra("callerUserId")
        val callerEmail = intent.getStringExtra("callerEmail")
        val callerName = intent.getStringExtra("callerName")

        val uri = buildCallUri(roomId, callerUserId, callerEmail, callerName)
        context.startActivity(
            Intent(Intent.ACTION_VIEW, uri).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_NO_ANIMATION
            }
        )
    }
}
