package org.voicepopuli.voice.calldismissedeventemitter

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import org.voicepopuli.voice.NativeCallDismissedEventEmitterAndroidSpec

// the generated Spec is the parent that already knows how to fire onCallDismissed.
class CallDismissedEventEmitter(reactContext: ReactApplicationContext) :
    NativeCallDismissedEventEmitterAndroidSpec(reactContext) {

  companion object {
    const val NAME = "NativeCallDismissedEventEmitterAndroid"
    private var instance: CallDismissedEventEmitter? = null

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
