package org.voicepopuli.voice

import android.app.AlertDialog
import android.app.AppOpsManager
import android.os.Bundle
import android.os.Build
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import android.view.WindowManager
import android.content.ComponentName
import android.content.Intent
import android.app.NotificationManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.zoontek.rnbootsplash.RNBootSplash
import org.voicepopuli.voice.incomingcall.VoiceFirebaseMessagingService

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Voice"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(savedInstanceState)
        applyLockScreenFlagsIfCallIntent(intent)
        cancelCallNotificationIfNeeded(intent)
    }

    // list of permission/setup steps run sequentially across onResume cycles.
    // each step returns true if the requirement is already satisfied (advance to next),
    // false if it prompted the user (halt; next onResume continues the flow).
    private val nativePermissionsSteps: List<() -> Boolean> = listOf(
        { ensureFullScreenIntentPermission() },
        { ensureBatteryOptimizationExemption() },
        { ensureMiuiAutostart() },
        { ensureMiuiAppPermissions() },
    )


  override fun onResume() {
        super.onResume()
        // ensureFullScreenIntentPermission()
        // ensureBatteryOptimizationExemption()
        // ensureMiuiAutostart()
        // ensureMiuiAppPermissions()
        runNativePermissionsFlow()
  }

    private fun runNativePermissionsFlow() {
        for (step in nativePermissionsSteps) {
            if (!step()) return // step prompted; halt until next onResume resumes the flow
        }
    }


  override fun onNewIntent(intent: Intent) {
    // super.onNewIntent fires RN's LinkingModule listener, which emits the url event to JS
    // setIntent ensures getInitialURL returns the latest intent if JS queries it after resume
      super.onNewIntent(intent)
      applyLockScreenFlagsIfCallIntent(intent)
      setIntent(intent)
      cancelCallNotificationIfNeeded(intent)
  }


    private fun ensureFullScreenIntentPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true // api 34+

        val notificationManager = getSystemService(NotificationManager::class.java)
        if (notificationManager.canUseFullScreenIntent()) return true

        startActivity(
            Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
                .setData(Uri.parse("package:$packageName"))
        )
        return false
    }



    private fun ensureBatteryOptimizationExemption(): Boolean {
        val powerManager = getSystemService(PowerManager::class.java)
        if (powerManager.isIgnoringBatteryOptimizations(packageName)) return true

        val message = if (isMiui())
            "Voice needs to run in the background to receive incoming calls. Select \"No restrictions\" for background settings."
        else
            "Voice needs to run in the background to receive incoming calls. On the next screen, tap \"Allow\"."

        AlertDialog.Builder(this)
            .setTitle("Allow background activity")
            .setMessage(message)
            .setPositiveButton("Open settings") { _, _ ->
                startActivity(
                    Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                        .setData(Uri.parse("package:$packageName"))
                )
            }
            .setNegativeButton("Later", null)
            .show()
        return false
    }

  private fun cancelCallNotificationIfNeeded(intent: Intent) {
      val data = intent.data
      if (intent.action == Intent.ACTION_VIEW && 
          data?.scheme == "voice" &&
          data.host == "call") {
          getSystemService(NotificationManager::class.java)
              .cancel(VoiceFirebaseMessagingService.NOTIFICATION_ID)
      }
  }


    private fun applyLockScreenFlagsIfCallIntent(intent: Intent?) {
        val data = intent?.data
        val isCallIntent = data?.scheme == "voice" && data.host == "call"
        if (!isCallIntent) return

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
    }
}
