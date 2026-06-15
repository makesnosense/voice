package org.voicepopuli.voice

import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash
import org.voicepopuli.voice.incomingcall.VoiceFirebaseMessagingService
import org.voicepopuli.voice.nativepermissions.NativePermissionsFlow

class MainActivity : ReactActivity() {

    private val nativePermissionsFlow = NativePermissionsFlow(this)

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule rendering of the
     * component.
     */
    override fun getMainComponentName(): String = "Voice"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate] which allows you to
     * enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(savedInstanceState)

        @Suppress("DEPRECATION")
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            window.statusBarColor = android.graphics.Color.TRANSPARENT
            window.navigationBarColor = android.graphics.Color.TRANSPARENT
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }
        handleCallIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        if (nativePermissionsFlow.hasStarted) {
            runNativePermissionsFlow()
        }
    }

    internal fun runNativePermissionsFlow() {
        nativePermissionsFlow.runNativePermissions()
    }

    override fun onNewIntent(intent: Intent) {
        // super.onNewIntent fires RN's LinkingModule listener, which emits the url event to JS
        // setIntent ensures getInitialURL returns the latest intent if JS queries it after resume
        super.onNewIntent(intent)
        setIntent(intent)
        handleCallIntent(intent)
    }

    private fun handleCallIntent(intent: Intent?) {
        val data = intent?.data
        val isCallIntent = intent?.action == Intent.ACTION_VIEW && data?.scheme == "voice" && data?.host == "call"
        if (!isCallIntent) return

        // show over lock screen when accepting a call
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

        // clean up incoming call state
        getSystemService(NotificationManager::class.java).cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)
        VoiceFirebaseMessagingService.cancelVibration()
        VoiceFirebaseMessagingService.cancelTimeout()
        VoiceFirebaseMessagingService.clearPendingCall()
        sendBroadcast(Intent(VoiceFirebaseMessagingService.ACTION_INCOMING_CALL_DISMISSED).setPackage(packageName))
    }
}
