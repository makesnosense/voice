import { useEffect, useRef } from 'react';
import {
  fulfillPendingAnswerAction,
  subscribeCallAccepted,
  takeStoredAcceptedCallInfo,
} from '../native/voip-call-accepted-ios';
import type { IncomingCallInfo } from '../../../shared/types/calls';

export function useIncomingCall(
  onAnswered: (incomingCallInfo: IncomingCallInfo) => void,
) {
  // onAnswered here is joinCall, and it's module level, so it does not change,
  // still, not to rely on it, we still do a stable ref to subscribe to and invoke
  // fresh onAnswered each time the event fires
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  const joinAndFulfill = (incomingCallInfo: IncomingCallInfo) => {
    onAnsweredRef.current(incomingCallInfo);
    fulfillPendingAnswerAction();
  };

  useEffect(() => {
    const subscription = subscribeCallAccepted(joinAndFulfill);
    return () => subscription.remove();
  }, []);

  // cold start: accept happened before js subscribed; native kept it in storedAcceptedCallInfo
  useEffect(() => {
    takeStoredAcceptedCallInfo().then(incomingCallInfo => {
      if (incomingCallInfo) joinAndFulfill(incomingCallInfo);
    });
  }, []);
}
