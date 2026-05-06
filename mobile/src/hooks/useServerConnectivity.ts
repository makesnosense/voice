import { useEffect, useState } from 'react';
import { checkServerReachable } from '../screens/NoConnectionScreen';

export interface ServerConnectivity {
  isChecking: boolean;
  isUnreachable: boolean;
  isRetrying: boolean;
  retry: () => Promise<void>;
}

export function useServerConnectivity(): ServerConnectivity {
  const [isChecking, setIsChecking] = useState(true);
  const [isUnreachable, setIsUnreachable] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    (async () => {
      const reachable = await checkServerReachable();
      setIsUnreachable(!reachable);
      setIsChecking(false);
    })();
  }, []);

  const retry = async () => {
    setIsRetrying(true);
    try {
      const reachable = await checkServerReachable();
      setIsUnreachable(!reachable);
    } finally {
      setIsRetrying(false);
    }
  };

  return { isChecking, isUnreachable, isRetrying, retry };
}
