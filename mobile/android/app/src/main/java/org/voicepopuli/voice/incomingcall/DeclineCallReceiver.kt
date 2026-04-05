package org.voicepopuli.voice.incomingcall

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import kotlin.concurrent.thread

class DeclineCallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        VoiceFirebaseMessagingService.cancelVibration()
        context.getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)

        val roomId = intent.getStringExtra("roomId") ?: return
        val pendingResult = goAsync()
        thread {
            try {
                postCallDeclined(roomId)
            } catch (exception: Exception) {
                Log.e("DeclineCallReceiver", "failed to notify server of decline", exception)
            } finally {
                pendingResult.finish() // PendingResult is essentially a refcount — finish() releases it.
            }
        }
    }
}
