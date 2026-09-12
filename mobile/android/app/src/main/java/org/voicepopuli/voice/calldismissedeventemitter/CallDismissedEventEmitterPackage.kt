package org.voicepopuli.voice.calldismissedeventemitter

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class CallDismissedEventEmitterPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
      when (name) {
        CallDismissedEventEmitter.NAME -> CallDismissedEventEmitter(reactContext)
        else -> null
      }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
        CallDismissedEventEmitter.NAME to
            ReactModuleInfo(
                CallDismissedEventEmitter.NAME,
                CallDismissedEventEmitter.NAME,
                false,
                false,
                false,
                true,
            )
    )
  }
}
