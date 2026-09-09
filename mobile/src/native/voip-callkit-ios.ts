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
type VoipCallkitNativeModule = NativeModule & {
  fulfillPendingAnswerAction(): void;
  takeStoredAcceptedCallInfo(): Promise<unknown>;
  requestIosEndCallKitCall(): void;
};

const { VoipCallkit: voipCallkitNativeModule } = NativeModules as {
  VoipCallkit?: VoipCallkitNativeModule;
};

const voipCallkitJsEmitter =
  Platform.OS === 'ios' && voipCallkitNativeModule
    ? new NativeEventEmitter(voipCallkitNativeModule)
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

  if (!voipCallkitNativeModule?.fulfillPendingAnswerAction) {
    console.error('❌ VoipCallkit native module missing on iOS');
    return;
  }

  voipCallkitNativeModule.fulfillPendingAnswerAction();
}

export async function takeStoredAcceptedCallInfo(): Promise<IncomingCallInfo | null> {
  if (Platform.OS !== 'ios') return null;

  if (!voipCallkitNativeModule?.takeStoredAcceptedCallInfo) {
    console.error('❌ VoipCallkit native module missing on iOS');
    return null;
  }

  const unvalidatedAcceptedCallInfo =
    await voipCallkitNativeModule.takeStoredAcceptedCallInfo();
  return parseAcceptedCall(unvalidatedAcceptedCallInfo);
}

export function subscribeCallAccepted(
  onAccepted: (incomingCallInfo: IncomingCallInfo) => void,
) {
  if (Platform.OS !== 'ios') return { remove: () => {} };

  if (!voipCallkitJsEmitter) {
    console.error('❌ VoipCallkit native module missing on iOS');
    return { remove: () => {} };
  }

  return voipCallkitJsEmitter.addListener(
    'callAccepted',
    callAcceptedPayload => {
      const incomingCallInfo = parseAcceptedCall(callAcceptedPayload);
      if (incomingCallInfo) onAccepted(incomingCallInfo);
    },
  );
}

export function requestIosEndCallKitCall() {
  if (Platform.OS !== 'ios') return;

  if (!voipCallkitNativeModule?.requestIosEndCallKitCall) {
    console.error('❌ VoipCallkit native module missing on iOS');
    return;
  }

  voipCallkitNativeModule.requestIosEndCallKitCall();
}

export function subscribeCallEnded(onEnded: () => void) {
  if (Platform.OS !== 'ios') return { remove: () => {} };

  if (!voipCallkitJsEmitter) {
    console.error('❌ VoipCallkit native module missing on iOS');
    return { remove: () => {} };
  }

  return voipCallkitJsEmitter.addListener('callEnded', onEnded);
}
