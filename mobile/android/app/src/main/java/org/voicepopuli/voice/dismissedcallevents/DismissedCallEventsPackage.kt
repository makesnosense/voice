package org.voicepopuli.voice.dismissedcallevents

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class DismissedCallEventsPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
      when (name) {
        DismissedCallEventsModule.NAME -> DismissedCallEventsModule(reactContext)
        else -> null
      }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
        DismissedCallEventsModule.NAME to
            ReactModuleInfo(
                DismissedCallEventsModule.NAME,
                DismissedCallEventsModule.NAME,
                false,
                false,
                false,
                true,
            )
    )
  }
}
