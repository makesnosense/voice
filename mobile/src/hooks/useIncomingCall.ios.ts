import { useEffect, useRef } from 'react';
import { subscribeCallAccepted } from '../native/voip-call-accepted-ios';
import type { IncomingCallInfo } from '../../../shared/types/calls';

export function useIncomingCall(
  onAnswered: (params: IncomingCallInfo) => void,
) {
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  useEffect(() => {
    const subscription = subscribeCallAccepted(params => {
      onAnsweredRef.current(params);
    });
    return () => subscription.remove();
  }, []);
}
