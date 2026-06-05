package org.voicepopuli.voice.dismissedcallevents

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import org.voicepopuli.voice.incomingcall.VoiceFirebaseMessagingService

class DismissedCallEventsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val EVENT_INCOMING_CALL_DISMISSED = "IncomingCallDismissed"
  }

  private val callCancelledReceiver =
      object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
          reactApplicationContext
              .getJSModule(RCTDeviceEventEmitter::class.java)
              .emit(EVENT_INCOMING_CALL_DISMISSED, null)
        }
      }

  override fun getName() = "DismissedCallEvents"

  override fun initialize() {
    super.initialize()
    ContextCompat.registerReceiver(
        reactApplicationContext,
        callCancelledReceiver,
        IntentFilter(VoiceFirebaseMessagingService.ACTION_INCOMING_CALL_DISMISSED),
        ContextCompat.RECEIVER_NOT_EXPORTED,
    )
  }

  override fun invalidate() {
    reactApplicationContext.unregisterReceiver(callCancelledReceiver)
    super.invalidate()
  }

  @ReactMethod @Suppress("UNUSED_PARAMETER") fun addListener(_eventName: String) {}
  @ReactMethod @Suppress("UNUSED_PARAMETER") fun removeListeners(_count: Double) {}
}
