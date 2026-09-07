import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import type { IncomingCallInfo } from '../../../shared/types/calls';

function extractCallParams(url: string): IncomingCallInfo | null {
  const [, query] = url.split('?');
  if (!query) return null;
  const params = new URLSearchParams(query);

  const roomId = params.get('roomId');
  const callerUserId = params.get('callerUserId');
  const callerEmail = params.get('callerEmail');
  const callId = params.get('callId');
  if (!roomId || !callerUserId || !callerEmail || !callId) return null;

  return {
    roomId,
    callerUserId,
    callerEmail,
    callerName: params.get('callerName'),
    callId,
  };
}

export function useAnsweredCallDeepLink(
  onAnswered: (params: IncomingCallInfo) => void,
) {
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  useEffect(() => {
    const handleUrl = (url: string) => {
      const params = extractCallParams(url);
      if (params) onAnsweredRef.current(params);
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
