package org.voicepopuli.voice.lockscreenbypass

import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.voicepopuli.voice.MainActivity

class LockScreenBypassModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "LockScreenBypass"

    @ReactMethod
    fun revokeLockScreenBypass() {
        val activity = reactApplicationContext.currentActivity as? MainActivity ?: return
        activity.runOnUiThread {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                activity.setShowWhenLocked(false)
            }
        }
    }
}
