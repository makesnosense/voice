package org.voicepopuli.voice

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class DeclineCallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        context.getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)
        // TODO: notify server call was declined
    }
}
