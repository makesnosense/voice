package org.voicepopuli.voice

import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class IncomingCallActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // show over lock screen and turn screen on — the Telegram approach
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        // dismiss keyguard so buttons are tappable without unlock
        val km = getSystemService(KeyguardManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            km.requestDismissKeyguard(this, null)
        }

        // handle action extras (from notification action buttons)
        val action = intent.getStringExtra("action")
        val roomId = intent.getStringExtra("roomId")
        val callerName = intent.getStringExtra("callerName") ?: "unknown"

        when (action) {
            "accept" -> {
                acceptCall(roomId)
                return
            }
            "decline" -> {
                declineCall()
                return
            }
        }

        // no action = full-screen intent triggered, show the UI
        setContentView(R.layout.activity_incoming_call)

        findViewById<TextView>(R.id.callerName).text = callerName

        findViewById<Button>(R.id.btnAccept).setOnClickListener {
            acceptCall(roomId)
        }

        findViewById<Button>(R.id.btnDecline).setOnClickListener {
            declineCall()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        // cancel the call notification
        getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)
    }

    private fun acceptCall(roomId: String?) {
        cancelNotification()
        val intent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = android.net.Uri.parse("voice://call?roomId=$roomId")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val options = android.app.ActivityOptions.makeCustomAnimation(this, 0, 0)
        startActivity(intent, options.toBundle())
        finish()
        overridePendingTransition(0, 0) 
    }

    private fun declineCall() {
        cancelNotification()
        finish()
    }

    private fun cancelNotification() {
        getSystemService(NotificationManager::class.java)
            .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)
    }
}
