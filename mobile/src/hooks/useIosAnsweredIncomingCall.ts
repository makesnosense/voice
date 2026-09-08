import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { subscribeCallAccepted } from '../native/voip-call-accepted-ios';
import type { IncomingCallInfo } from '../../../shared/types/calls';

export function useIosAnsweredIncomingCall(
  onAnswered: (params: IncomingCallInfo) => void,
) {
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const subscription = subscribeCallAccepted(params => {
      onAnsweredRef.current(params);
    });
    return () => subscription.remove();
  }, []);
}
