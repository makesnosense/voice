import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type EmptyPayload = Readonly<{}>;

export interface Spec extends TurboModule {
  readonly onCallDismissed: CodegenTypes.EventEmitter<EmptyPayload>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeDismissedCallEvents',
);
