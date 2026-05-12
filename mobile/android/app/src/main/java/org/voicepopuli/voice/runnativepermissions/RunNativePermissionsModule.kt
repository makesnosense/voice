package org.voicepopuli.voice.runnativepermissions

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.voicepopuli.voice.MainActivity

class RunNativePermissionsModule(reactContext: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RunNativePermissions"

    @ReactMethod
    fun run() {
        val activity = reactApplicationContext.currentActivity as? MainActivity ?: return
        activity.runOnUiThread {
            activity.reactNativePermissionsGranted = true
            activity.runNativePermissionsFlow()
        }
    }
}
