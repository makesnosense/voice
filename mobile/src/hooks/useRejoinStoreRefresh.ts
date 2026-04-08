import { useEffect } from 'react';
import { useRejoinStore } from '../stores/useRejoinStore';
import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { HOME_TAB, type HomeTab } from '../components/NavigationBar';

export function useRejoinStoreRefresh(activeTab: HomeTab) {
  useEffect(() => {
    if (activeTab !== HOME_TAB.CALLS) return;
    const { lastRoomId } = useRejoinStore.getState();
    if (!lastRoomId) return;
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    api.rooms
      .checkAlive(lastRoomId, accessToken)
      .then(({ alive, userCount }) => {
        if (!alive) {
          useRejoinStore.setState({ lastRoomId: null, userCount: null });
        } else {
          useRejoinStore.setState({ userCount });
        }
      });
  }, [activeTab]);
}
