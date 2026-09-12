import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type EmptyPayload = Readonly<{}>;

// This module is needed so RN side would drain dissmised calls queue when RN is up
// (when some call was dissmised) so Call History is reactive

export interface Spec extends TurboModule {
  // this is the subscriber on JS side, it accepts handler (check EventEmitter type)
  // JS:  module.onCallDismissed(callback)
  // Codegen generates Java parent abstract class based on it: emitOnCallDismissed(map)
  // emit* is added to onCallDismissed cause it is EventEmitter – it emits the event the subsriber wait for
  // the class is abstract but it has a module that emits
  readonly onCallDismissed: CodegenTypes.EventEmitter<EmptyPayload>;
}

// thuis returns a JS object that has a subscriber method (module.onCallDismissed(handler)):
// that passes the handler to the C++ HostObject, which stores handler in AsyncEventEmitter’s listener map.
export default TurboModuleRegistry.get<Spec>(
  'NativeCallDismissedEventEmitterAndroid',
);
