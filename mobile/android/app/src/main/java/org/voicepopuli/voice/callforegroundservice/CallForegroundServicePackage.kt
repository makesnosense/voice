package org.voicepopuli.voice.callforegroundservice

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class CallForegroundServicePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) =
        listOf(CallForegroundServiceModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext) =
        emptyList<ViewManager<*, *>>()
}
