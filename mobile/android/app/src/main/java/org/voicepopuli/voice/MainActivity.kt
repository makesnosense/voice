package org.voicepopuli.voice

import android.os.Bundle
import android.content.Intent
import android.app.NotificationManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

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
      super.onCreate(savedInstanceState)
      cancelCallNotificationIfNeeded(intent)
  }

  override fun onNewIntent(intent: Intent) {
    // super.onNewIntent fires RN's LinkingModule listener, which emits the url event to JS
    // setIntent ensures getInitialURL returns the latest intent if JS queries it after resume
      super.onNewIntent(intent)
      setIntent(intent)
      cancelCallNotificationIfNeeded(intent)
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
}
