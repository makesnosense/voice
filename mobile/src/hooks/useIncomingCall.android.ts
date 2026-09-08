import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import type { IncomingCallInfo } from '../../../shared/types/calls';

function extractCallParams(url: string): IncomingCallInfo | null {
  const [, query] = url.split('?');
  if (!query) return null;
  const incomingCallInfo = new URLSearchParams(query);

  const roomId = incomingCallInfo.get('roomId');
  const callerUserId = incomingCallInfo.get('callerUserId');
  const callerEmail = incomingCallInfo.get('callerEmail');
  const callId = incomingCallInfo.get('callId');
  if (!roomId || !callerUserId || !callerEmail || !callId) return null;

  return {
    roomId,
    callerUserId,
    callerEmail,
    callerName: incomingCallInfo.get('callerName'),
    callId,
  };
}

export function useIncomingCall(
  onAnswered: (incomingCallInfo: IncomingCallInfo) => void,
) {
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  useEffect(() => {
    const handleUrl = (url: string) => {
      const incomingCallInfo = extractCallParams(url);
      if (incomingCallInfo) onAnsweredRef.current(incomingCallInfo);
    };

    Linking.getInitialURL().then(url => {
      if (url) handleUrl(url);
    });

    const urlListener = Linking.addEventListener('url', ({ url }) =>
      handleUrl(url),
    );
    return () => urlListener.remove();
  }, []);
}
