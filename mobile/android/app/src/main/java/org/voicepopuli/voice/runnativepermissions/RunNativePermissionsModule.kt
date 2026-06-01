package org.voicepopuli.voice.runnativepermissions

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.voicepopuli.voice.MainActivity

class RunNativePermissionsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RunNativePermissions"

    private var started = false

    @ReactMethod
    fun run() {
        Log.d("NativePermissions", "we are in RunNativePermissionsModule")
        if (started) return
        started = true
        Log.d("NativePermissions", "RunNativePermissionsModule.run() called")
        val activity = reactApplicationContext.currentActivity as? MainActivity ?: return
        activity.runOnUiThread {
            Log.d("NativePermissions", "activity.runNativePermissionsFlow() would run")
            activity.runNativePermissionsFlow()
        }
    }
}
