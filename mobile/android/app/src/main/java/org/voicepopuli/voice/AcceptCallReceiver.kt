package org.voicepopuli.voice

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri

class AcceptCallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        VoiceFirebaseMessagingService.cancelVibration()
        context.getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)

        val roomId = intent.getStringExtra("roomId")
        context.startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse("voice://call?roomId=$roomId")).apply {
                setClass(context, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_NO_ANIMATION
            }
        )
    }
}
