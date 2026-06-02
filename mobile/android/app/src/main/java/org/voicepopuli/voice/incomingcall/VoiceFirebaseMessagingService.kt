package org.voicepopuli.voice.incomingcall

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.voicepopuli.voice.R

class VoiceFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        const val CHANNEL_ID = "incoming_calls"
        const val NOTIFICATION_ID = 3333
        const val ACTION_CALL_CANCELLED = "org.voicepopuli.voice.CALL_CANCELLED"
        const val CALL_NOTIFICATION_TIMEOUT_MS = 60_000L

        private var vibrator: Vibrator? = null
        private var appContext: Context? = null

        private val timeoutHandler = Handler(Looper.getMainLooper())
        private val timeoutRunnable = Runnable {
            cancelVibration()
            appContext?.run { sendBroadcast(Intent(ACTION_CALL_CANCELLED).setPackage(packageName)) }
        }

        fun cancelVibration() {
            vibrator?.cancel()
            vibrator = null
        }

        fun scheduleTimeout(context: Context) {
            appContext = context.applicationContext
            timeoutHandler.postDelayed(timeoutRunnable, CALL_NOTIFICATION_TIMEOUT_MS)
        }

        fun cancelTimeout() {
            timeoutHandler.removeCallbacks(timeoutRunnable)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        when (message.data["type"]) {
            "incoming_call" -> handleIncomingCall(message.data)
            "call_cancelled" -> handleCallCancelled()
        }
    }

    private fun handleIncomingCall(data: Map<String, String>) {
        // acquire before anything else — wakes screen so full-screen intent fires reliably
        acquireScreenWakeLock()

        val callerEmail = data["callerEmail"] ?: "unknown"
        val callerName = data["callerName"]?.takeIf { it.isNotEmpty() } ?: callerEmail
        val callerUserId = data["callerUserId"] ?: return
        val callId = data["callId"] ?: return
        val roomId = data["roomId"] ?: return

        val sentAt = data["sentAt"]?.toLongOrNull() ?: System.currentTimeMillis()
        val notificationAgeMs = System.currentTimeMillis() - sentAt
        val remainingNotificationLifeMs = CALL_NOTIFICATION_TIMEOUT_MS - notificationAgeMs
        if (remainingNotificationLifeMs <= 0) return // call already expired before delivery

        ensureNotificationChannel()
        showIncomingCallNotification(callerName, callerUserId, callerEmail, roomId, callId)
        startVibration()
        scheduleTimeout(this)
    }

    private fun handleCallCancelled() {
        cancelTimeout()
        cancelVibration()
        getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
        sendBroadcast(
            Intent(ACTION_CALL_CANCELLED).setPackage(packageName)
        ) // we need this to close fullscreen activity
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = getSystemService(NotificationManager::class.java)
        // delete old soundless channel if it exists, recreate with correct sound
        manager.deleteNotificationChannel(CHANNEL_ID)

        val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        val audioAttributes =
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

        val channel =
            NotificationChannel(
                    CHANNEL_ID,
                    "incoming calls",
                    // high importance is required for heads-up + full-screen intent
                    NotificationManager.IMPORTANCE_HIGH
                )
                .apply {
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

        vibrator =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                getSystemService(VibratorManager::class.java).defaultVibrator
            } else {
                @Suppress("DEPRECATION") getSystemService(Vibrator::class.java)
            }

        @Suppress("DEPRECATION")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // USAGE_RINGTONE bypasses silent/ringer mode
            val attrs = VibrationAttributes.Builder().setUsage(VibrationAttributes.USAGE_RINGTONE).build()
            vibrator?.vibrate(effect, attrs)
        } else {
            // USAGE_ALARM is the closest pre-api-33 equivalent
            val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build()
            vibrator?.vibrate(effect, attrs)
        }
    }

    private fun acquireScreenWakeLock() {
        val powerManager = getSystemService(PowerManager::class.java)
        @Suppress("DEPRECATION")
        val wakeLock =
            powerManager.newWakeLock(
                // SCREEN_BRIGHT_WAKE_LOCK is deprecated but ACQUIRE_CAUSES_WAKEUP
                // has no modern equivalent — this is the only way to wake the screen
                // from a non-activity context.
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "voice:incoming_call_wake"
            )
        // 30s is generous — the activity will take over screen management once shown
        wakeLock.acquire(30_000L)
    }

    private fun showIncomingCallNotification(
        callerName: String,
        callerUserId: String,
        callerEmail: String,
        roomId: String,
        callId: String,
    ) {
        val notificationManager = getSystemService(NotificationManager::class.java)

        val incomingCallFullscreenIntent =
            Intent(this, IncomingCallFullScreenActivity::class.java).apply {
                putExtra("callerName", callerName)
                putExtra("callerUserId", callerUserId)
                putExtra("callerEmail", callerEmail)
                putExtra("roomId", roomId)
                putExtra("callId", callId)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
        val incomingCallFullscreenPendingIntent =
            PendingIntent.getActivity(
                this,
                0,
                incomingCallFullscreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

        val notificationBarDeclineIntent =
            Intent(this, DeclineCallReceiver::class.java).apply { putExtra("roomId", roomId) }

        val notificationBarDeclinePendingIntent =
            PendingIntent.getBroadcast(
                this,
                1,
                notificationBarDeclineIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

        val notificationBarAcceptIntent =
            Intent(this, AcceptCallReceiver::class.java).apply {
                putExtra("roomId", roomId)
                putExtra("callerUserId", callerUserId)
                putExtra("callerEmail", callerEmail)
                putExtra("callerName", callerName)
                putExtra("callId", callId)
            }
        val notificationBarAcceptPendingIntent =
            PendingIntent.getBroadcast(
                this,
                2,
                notificationBarAcceptIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

        val notification =
            NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification_call)
                .setContentTitle("incoming call")
                .setContentText(callerName)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setFullScreenIntent(incomingCallFullscreenPendingIntent, true)
                .setOngoing(true)
                .setAutoCancel(false)
                .addAction(R.drawable.ic_notification_call, "decline", notificationBarDeclinePendingIntent)
                .addAction(R.drawable.ic_notification_call, "accept", notificationBarAcceptPendingIntent)
                .setTimeoutAfter(CALL_NOTIFICATION_TIMEOUT_MS)
                .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
