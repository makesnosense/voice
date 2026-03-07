package org.voicepopuli.voice

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class VoiceFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        const val CHANNEL_ID = "incoming_calls"
            // arbitrary id — used to cancel this specific notification later via notificatonManager.cancel(NOTIFICATION_ID)
        const val NOTIFICATION_ID = 3333
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        if (data["type"] != "incoming_call") return

        val callerEmail = data["callerEmail"] ?: "unknown"
        val callerName = data["callerName"]?.takeIf { it.isNotEmpty() } ?: callerEmail
        val roomId = data["roomId"] ?: return

        ensureNotificationChannel()
        showIncomingCallNotification(callerName, roomId)
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return

        val channel = NotificationChannel(
            CHANNEL_ID,
            "incoming calls",
            // high importance is required for heads-up + full-screen intent
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "incoming voice call alerts"
            enableVibration(true)
        }
        manager.createNotificationChannel(channel)
    }

    private fun showIncomingCallNotification(callerName: String, roomId: String) {
        val notificationManager = getSystemService(NotificationManager::class.java)

        //  incoming call screen — shown when device is locked or screen is off
        val incomingCallFullscreenIntent = Intent(this, IncomingCallFullScreenActivity::class.java).apply {
            putExtra("callerName", callerName)
            putExtra("roomId", roomId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val incomingCallFullscreenPendingIntent = PendingIntent.getActivity(
            this, 0, incomingCallFullscreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // decline action — handled by DeclineCallReceiver
        val notificationBarDeclineIntent = Intent(this, DeclineCallReceiver::class.java)
        val notificationBarDeclinePendingIntent = PendingIntent.getBroadcast(
            this, 1, notificationBarDeclineIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBarAcceptIntent = Intent(Intent.ACTION_VIEW, 
            android.net.Uri.parse("voice://call?roomId=$roomId")).apply {
            setClass(applicationContext, MainActivity::class.java)
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or 
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_NO_ANIMATION
        }

        val notificationBarAcceptPendingIntent = PendingIntent.getActivity(
            this, 2, notificationBarAcceptIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_call)
            .setContentTitle("incoming call")
            .setContentText(callerName)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(incomingCallFullscreenPendingIntent, true)
            .setOngoing(true)
            .setAutoCancel(false)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "decline", notificationBarDeclinePendingIntent)
            .addAction(android.R.drawable.ic_menu_call, "accept", notificationBarAcceptPendingIntent)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

}
