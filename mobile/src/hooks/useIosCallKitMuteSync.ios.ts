import { useEffect } from 'react';
import { useWebRTCStore } from '../../../shared/stores/useWebRTCStore';
import {
  requestIosSetMuteStateInCallKit,
  subscribeMuteStateChanged,
} from '../native/voip-callkit-ios';

export function useIosCallKitMuteSync() {
  const isMutedLocal = useWebRTCStore(state => state.isMutedLocal);

  useEffect(() => {
    // CallKit → app mute
    const muteStateChangedSubscription = subscribeMuteStateChanged(isMuted => {
      useWebRTCStore.getState().setMuted(isMuted);
    });
    return () => muteStateChangedSubscription.remove();
  }, []);

  // app → CallKit mute
  useEffect(() => {
    requestIosSetMuteStateInCallKit(isMutedLocal);
  }, [isMutedLocal]);
}
