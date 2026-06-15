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
import com.tencent.mmkv.MMKV
import org.json.JSONArray
import org.json.JSONObject
import org.voicepopuli.voice.MainActivity
import org.voicepopuli.voice.R
import org.voicepopuli.voice.dismissedcallevents.DismissedCallEventsModule

class VoiceFirebaseMessagingService : FirebaseMessagingService() {

    data class PendingCallParams(
        val callId: String,
        val callerUserId: String,
        val callerEmail: String,
        val callerName: String?,
        val sentAt: Long,
    )

    companion object {
        const val CHANNEL_ID = "incoming_calls"
        const val NOTIFICATION_ID = 3333
        const val MISSED_CALL_NOTIFICATION_ID = 3334
        private const val MISSED_CALL_CHANNEL_ID = "missed_calls"
        const val ACTION_INCOMING_CALL_DISMISSED = "org.voicepopuli.voice.INCOMING_CALL_DISMISSED"
        const val CALL_NOTIFICATION_TIMEOUT_MS = 60_000L

        private const val DISMISSED_CALL_LOGS_MMKV_ID = "dismissed-call-logs"
        private const val QUEUE_KEY = "queue"
        private const val OUTCOME_CANCELLED = "cancelled"
        private const val OUTCOME_NO_ANSWER = "no-answer"
        private const val OUTCOME_DECLINED = "declined"

        private var vibrator: Vibrator? = null
        var pendingCall: PendingCallParams? = null

        private var appContext: Context? = null

        private val timeoutHandler = Handler(Looper.getMainLooper())
        private val timeoutRunnable = Runnable {
            cancelVibration()
            pendingCall?.let { params ->
                val callerDisplayName = params.callerName ?: params.callerEmail
                enqueueDismissedCallLog(params, OUTCOME_NO_ANSWER)
                appContext?.let { context -> showMissedCallNotification(context, callerDisplayName) }
                pendingCall = null
            }
            DismissedCallEventsModule.emitDismissed()
        }

        fun cancelVibration() {
            vibrator?.cancel()
            vibrator = null
        }

        fun scheduleTimeout() {
            timeoutHandler.postDelayed(timeoutRunnable, CALL_NOTIFICATION_TIMEOUT_MS)
        }

        fun cancelTimeout() {
            timeoutHandler.removeCallbacks(timeoutRunnable)
        }

        fun clearPendingCall() {
            pendingCall = null
        }

        fun enqueueDismissedCallLog(params: PendingCallParams, outcome: String) {
            val mmkv = MMKV.mmkvWithID(DISMISSED_CALL_LOGS_MMKV_ID)
            val existing = mmkv.decodeString(QUEUE_KEY) ?: "[]"
            val queue =
                try {
                    JSONArray(existing)
                } catch (_: Exception) {
                    JSONArray()
                }
            queue.put(
                JSONObject().apply {
                    put("callId", params.callId)
                    put("callerUserId", params.callerUserId)
                    put("callerEmail", params.callerEmail)
                    put("callerName", params.callerName ?: JSONObject.NULL)
                    put("createdAt", params.sentAt)
                    put("outcome", outcome)
                }
            )
            mmkv.encode(QUEUE_KEY, queue.toString())
        }

        fun handleCallDeclined() {
            cancelVibration()
            cancelTimeout()
            pendingCall?.let { params ->
                enqueueDismissedCallLog(params, OUTCOME_DECLINED)
                pendingCall = null
            }
            DismissedCallEventsModule.emitDismissed()
        }

        private fun showMissedCallNotification(context: Context, callerDisplayName: String) {
            ensureMissedCallChannel(context)

            val openAppIntent =
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            val openAppPendingIntent =
                PendingIntent.getActivity(
                    context,
                    0,
                    openAppIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )

            val notification =
                NotificationCompat.Builder(context, MISSED_CALL_CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification_missed_call)
                    .setContentTitle("Missed call")
                    .setContentText(callerDisplayName)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(openAppPendingIntent)
                    .setAutoCancel(true)
                    .build()

            context.getSystemService(NotificationManager::class.java).notify(MISSED_CALL_NOTIFICATION_ID, notification)
        }

        private fun ensureMissedCallChannel(context: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val manager = context.getSystemService(NotificationManager::class.java)
            if (manager.getNotificationChannel(MISSED_CALL_CHANNEL_ID) != null) return

            val channel =
                NotificationChannel(
                        MISSED_CALL_CHANNEL_ID,
                        "missed calls",
                        // high importance = heads-up banner; sound/vibration suppressed below
                        // since the device already rang for the incoming call
                        NotificationManager.IMPORTANCE_HIGH,
                    )
                    .apply {
                        description = "missed call alerts"
                        enableVibration(false)
                        setSound(null, null)
                    }
            manager.createNotificationChannel(channel)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        when (message.data["type"]) {
            "incoming_call" -> handleIncomingCall(message.data)
            "call_cancelled" -> handleCallCancelled()
            "call_declined" -> handleCallDeclined()
        }
    }

    private fun handleIncomingCall(data: Map<String, String>) {
        // store application context so the companion-object timeoutRunnable can post a notification
        appContext = applicationContext
        // acquire before anything else — wakes screen so full-screen intent fires reliably
        acquireScreenWakeLock()

        val callerEmail = data["callerEmail"] ?: "unknown"
        val callerNameOrNull = data["callerName"]?.takeIf { it.isNotEmpty() }
        val callerDisplayName = callerNameOrNull ?: callerEmail
        val callerUserId = data["callerUserId"] ?: return
        val callId = data["callId"] ?: return
        val roomId = data["roomId"] ?: return

        val sentAt = data["sentAt"]?.toLongOrNull() ?: System.currentTimeMillis()
        val notificationAgeMs = System.currentTimeMillis() - sentAt
        val remainingNotificationLifeMs = CALL_NOTIFICATION_TIMEOUT_MS - notificationAgeMs
        if (remainingNotificationLifeMs <= 0) return // call already expired before delivery

        pendingCall = PendingCallParams(callId, callerUserId, callerEmail, callerNameOrNull, sentAt)

        ensureNotificationChannel()
        scheduleTimeout()
        showIncomingCallNotification(
            callerDisplayName,
            callerUserId,
            callerEmail,
            roomId,
            callId,
        )
        startVibration()
    }

    private fun handleCallCancelled() {
        cancelVibration()
        cancelTimeout()
        pendingCall?.let { params ->
            val callerDisplayName = params.callerName ?: params.callerEmail
            enqueueDismissedCallLog(params, OUTCOME_CANCELLED)
            showMissedCallNotification(applicationContext, callerDisplayName)
            pendingCall = null
        }
        getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
        sendBroadcast(Intent(ACTION_INCOMING_CALL_DISMISSED).setPackage(packageName))
        DismissedCallEventsModule.emitDismissed()
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = getSystemService(NotificationManager::class.java)
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
                    NotificationManager.IMPORTANCE_HIGH,
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
                "voice:incoming_call_wake",
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
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val notificationBarDeclineIntent =
            Intent(this, DeclineCallReceiver::class.java).apply {
                putExtra("roomId", roomId)
                putExtra("callId", callId)
            }
        val notificationBarDeclinePendingIntent =
            PendingIntent.getBroadcast(
                this,
                1,
                notificationBarDeclineIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val notificationBarAcceptIntent =
            Intent(Intent.ACTION_VIEW, buildCallUri(roomId, callerUserId, callerEmail, callerName, callId)).apply {
                setClass(this@VoiceFirebaseMessagingService, MainActivity::class.java)
                flags =
                    Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_ANIMATION
            }
        val notificationBarAcceptPendingIntent =
            PendingIntent.getActivity(
                this,
                2,
                notificationBarAcceptIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
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
