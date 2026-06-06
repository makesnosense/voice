package org.voicepopuli.voice.dismissedcallevents

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import org.voicepopuli.voice.NativeDismissedCallEventsSpec

class DismissedCallEventsModule(reactContext: ReactApplicationContext) : NativeDismissedCallEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeDismissedCallEvents"
    private var instance: DismissedCallEventsModule? = null

    fun emitDismissed() {
      instance?.emitOnCallDismissed(Arguments.createMap())
    }
  }

  init {
    instance = this
  }

  override fun getName() = NAME

  override fun invalidate() {
    instance = null
    super.invalidate()
  }
}
