import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type NativeModule,
} from 'react-native';
import type { IncomingCallInfo } from '../../../shared/types/calls';

// NativeModule is RN's event-emitter shape: addListener / removeListeners only
// the same object also has the method fulfillPendingAnswerAction we export from ObjC
// NativeModules — a dictionary of every RCT_EXPORT_MODULE() RN loaded
type VoipCallAcceptedNativeModule = NativeModule & {
  fulfillPendingAnswerAction(): void;
};

const { VoipCallAcceptedEmitter: voipCallAcceptedNativeModule } =
  NativeModules as { VoipCallAcceptedEmitter?: VoipCallAcceptedNativeModule };

const voipCallAcceptedJsEmitter =
  Platform.OS === 'ios' && voipCallAcceptedNativeModule
    ? new NativeEventEmitter(voipCallAcceptedNativeModule)
    : null;

function isValidIncomingCallInfo(
  callAcceptedPayload: unknown,
): callAcceptedPayload is IncomingCallInfo {
  if (typeof callAcceptedPayload !== 'object' || callAcceptedPayload === null) {
    return false;
  }

  const { roomId, callerUserId, callerEmail, callerName, callId } =
    callAcceptedPayload as Record<string, unknown>;

  const hasRequiredStrings =
    typeof roomId === 'string' &&
    typeof callerUserId === 'string' &&
    typeof callerEmail === 'string' &&
    typeof callId === 'string';

  const nameOk = callerName === null || typeof callerName === 'string';

  return hasRequiredStrings && nameOk;
}

function parseAcceptedCall(
  callAcceptedPayload: unknown,
): IncomingCallInfo | null {
  if (!isValidIncomingCallInfo(callAcceptedPayload)) return null;
  return callAcceptedPayload;
}

export function fulfillPendingAnswerAction() {
  if (Platform.OS !== 'ios') return;

  if (!voipCallAcceptedNativeModule?.fulfillPendingAnswerAction) {
    console.error('❌ VoipCallAcceptedEmitter native module missing on iOS');
    return;
  }

  voipCallAcceptedNativeModule.fulfillPendingAnswerAction();
}

export function subscribeCallAccepted(
  onAccepted: (params: IncomingCallInfo) => void,
) {
  if (Platform.OS !== 'ios') return { remove: () => {} };

  if (!voipCallAcceptedJsEmitter) {
    console.error('❌ VoipCallAcceptedEmitter native module missing on iOS');
    return { remove: () => {} };
  }

  return voipCallAcceptedJsEmitter.addListener(
    'callAccepted',
    callAcceptedPayload => {
      const params = parseAcceptedCall(callAcceptedPayload);
      if (params) onAccepted(params);
    },
  );
}
