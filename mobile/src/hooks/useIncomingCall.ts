import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

export interface IncomingCallParams {
  roomId: string;
  callerUserId: string;
  callerEmail: string;
  callerName: string | null;
}

function extractCallParams(url: string): IncomingCallParams | null {
  const [, query] = url.split('?');
  if (!query) return null;
  const params = new URLSearchParams(query);

  const roomId = params.get('roomId');
  const callerUserId = params.get('callerUserId');
  const callerEmail = params.get('callerEmail');
  if (!roomId || !callerUserId || !callerEmail) return null;

  return {
    roomId,
    callerUserId,
    callerEmail,
    callerName: params.get('callerName'),
  };
}

export function useIncomingCall(onCall: (params: IncomingCallParams) => void) {
  const onCallRef = useRef(onCall);
  onCallRef.current = onCall;

  useEffect(() => {
    const handleUrl = (url: string) => {
      const params = extractCallParams(url);
      if (params) onCallRef.current(params);
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
