package org.voicepopuli.voice

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class VoiceFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        const val CHANNEL_ID = "incoming_calls"
        const val NOTIFICATION_ID = 3333

        private var vibrator: Vibrator? = null

        fun cancelVibration() {
            vibrator?.cancel()
            vibrator = null
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        if (data["type"] != "incoming_call") return

        val callerEmail = data["callerEmail"] ?: "unknown"
        val callerName = data["callerName"]?.takeIf { it.isNotEmpty() } ?: callerEmail
        val roomId = data["roomId"] ?: return

        ensureNotificationChannel()
        showIncomingCallNotification(callerName, roomId)
        startVibration()
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = getSystemService(NotificationManager::class.java)
        // delete old soundless channel if it exists, recreate with correct sound
        manager.deleteNotificationChannel(CHANNEL_ID)

        val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        val channel = NotificationChannel(
            CHANNEL_ID,
            "incoming calls",
            // high importance is required for heads-up + full-screen intent
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "incoming voice call alerts"
            // channel vibration as fallback for ringer-on mode
            enableVibration(true)
            setSound(ringtoneUri, audioAttributes)
        }
        manager.createNotificationChannel(channel)
    }

    private fun startVibration() {
        // repeating: 0ms delay, 500ms on, 500ms off
        val effect = VibrationEffect.createWaveform(longArrayOf(0, 500, 500), 0)

        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSystemService(VibratorManager::class.java).defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Vibrator::class.java)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // USAGE_RINGTONE bypasses silent/ringer mode
            val attrs = VibrationAttributes.Builder()
                .setUsage(VibrationAttributes.USAGE_RINGTONE)
                .build()
            vibrator?.vibrate(effect, attrs)
        } else {
            // USAGE_ALARM is the closest pre-api-33 equivalent
            @Suppress("DEPRECATION")
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()
            vibrator?.vibrate(effect, attrs)
        }
    }

    private fun showIncomingCallNotification(callerName: String, roomId: String) {
        val notificationManager = getSystemService(NotificationManager::class.java)

        val incomingCallFullscreenIntent = Intent(this, IncomingCallFullScreenActivity::class.java).apply {
            putExtra("callerName", callerName)
            putExtra("roomId", roomId)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val incomingCallFullscreenPendingIntent = PendingIntent.getActivity(
            this, 0, incomingCallFullscreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBarDeclineIntent = Intent(this, DeclineCallReceiver::class.java)
        val notificationBarDeclinePendingIntent = PendingIntent.getBroadcast(
            this, 1, notificationBarDeclineIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBarAcceptIntent = Intent(this, AcceptCallReceiver::class.java).apply {
            putExtra("roomId", roomId)
        }
        val notificationBarAcceptPendingIntent = PendingIntent.getBroadcast(
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
