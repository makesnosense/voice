import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type NativeModule,
} from 'react-native';
import type { IncomingCallInfo } from '../../../shared/types/calls';

// NativeModule is RN's event-emitter shape: addListener / removeListeners only
// the same object also has the methods we export from ObjC
// NativeModules — a dictionary of every RCT_EXPORT_MODULE() RN loaded
type VoipCallEventsNativeModule = NativeModule & {
  fulfillPendingAnswerAction(): void;
  takeStoredAcceptedCallInfo(): Promise<unknown>;
};

const { VoipCallEventsEmitter: voipCallEventsNativeModule } =
  NativeModules as { VoipCallEventsEmitter?: VoipCallEventsNativeModule };

const voipCallEventsJsEmitter =
  Platform.OS === 'ios' && voipCallEventsNativeModule
    ? new NativeEventEmitter(voipCallEventsNativeModule)
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

  if (!voipCallEventsNativeModule?.fulfillPendingAnswerAction) {
    console.error('❌ VoipCallEventsEmitter native module missing on iOS');
    return;
  }

  voipCallEventsNativeModule.fulfillPendingAnswerAction();
}

export async function takeStoredAcceptedCallInfo(): Promise<IncomingCallInfo | null> {
  if (Platform.OS !== 'ios') return null;

  if (!voipCallEventsNativeModule?.takeStoredAcceptedCallInfo) {
    console.error('❌ VoipCallEventsEmitter native module missing on iOS');
    return null;
  }

  const unvalidatedAcceptedCallInfo =
    await voipCallEventsNativeModule.takeStoredAcceptedCallInfo();
  return parseAcceptedCall(unvalidatedAcceptedCallInfo);
}

export function subscribeCallAccepted(
  onAccepted: (incomingCallInfo: IncomingCallInfo) => void,
) {
  if (Platform.OS !== 'ios') return { remove: () => {} };

  if (!voipCallEventsJsEmitter) {
    console.error('❌ VoipCallEventsEmitter native module missing on iOS');
    return { remove: () => {} };
  }

  return voipCallEventsJsEmitter.addListener(
    'callAccepted',
    callAcceptedPayload => {
      const incomingCallInfo = parseAcceptedCall(callAcceptedPayload);
      if (incomingCallInfo) onAccepted(incomingCallInfo);
    },
  );
}

export function subscribeCallEnded(onEnded: () => void) {
  if (Platform.OS !== 'ios') return { remove: () => {} };

  if (!voipCallEventsJsEmitter) {
    console.error('❌ VoipCallEventsEmitter native module missing on iOS');
    return { remove: () => {} };
  }

  return voipCallEventsJsEmitter.addListener('callEnded', onEnded);
}
