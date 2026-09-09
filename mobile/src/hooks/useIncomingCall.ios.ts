import { useEffect, useRef } from 'react';
import {
  fulfillPendingAnswerAction,
  subscribeCallAccepted,
  subscribeCallEnded,
  takeStoredAcceptedCallInfo,
} from '../native/voip-call-events-ios';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';
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
    const accepted = subscribeCallAccepted(joinAndFulfill);
    const ended = subscribeCallEnded(() => {
      useActiveRoomStore.setState({ activeRoomId: null });
    });
    return () => {
      accepted.remove();
      ended.remove();
    };
  }, []);

  // cold start: accept happened before js subscribed; native kept it in storedAcceptedCallInfo
  useEffect(() => {
    takeStoredAcceptedCallInfo().then(incomingCallInfo => {
      if (incomingCallInfo) joinAndFulfill(incomingCallInfo);
    });
  }, []);
}
