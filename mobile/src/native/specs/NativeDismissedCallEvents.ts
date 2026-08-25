import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type EmptyPayload = Readonly<{}>;

export interface Spec extends TurboModule {
  readonly onCallDismissed: CodegenTypes.EventEmitter<EmptyPayload>;
}

// ios has no native implementation yet — call-dismissal tracking depends on
// the pushkit/callkit work, which isn't built. android enforcement happens
// at the call site instead, since codegen only allows one registry call here.
export default TurboModuleRegistry.get<Spec>('NativeDismissedCallEvents');
