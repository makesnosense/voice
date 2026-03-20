package org.voicepopuli.voice.activityready

import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class ActivityReadyModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    LifecycleEventListener {

    companion object {
        const val EVENT_ACTIVITY_READY = "ActivityReady"
    }

    @Volatile private var isReady = false

    override fun getName() = "ActivityReady"

    override fun initialize() {
        super.initialize()
        reactApplicationContext.addLifecycleEventListener(this)
    }

    override fun onHostResume() {
        isReady = true
        reactApplicationContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(EVENT_ACTIVITY_READY, null)
    }

    override fun onHostPause() {}

    override fun onHostDestroy() {
        isReady = false
    }

    override fun invalidate() {
        reactApplicationContext.removeLifecycleEventListener(this)
        super.invalidate()
    }

    @ReactMethod fun isActivityReady(promise: Promise) = promise.resolve(isReady)
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Double) {}
}
