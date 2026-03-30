import { useEffect } from 'react';
import { useRejoinStore } from '../stores/useRejoinStore';
import { api } from '../api';
import { HOME_TAB, type HomeTab } from '../components/NavigationBar';

export function useRejoinStoreRefresh(activeTab: HomeTab) {
  useEffect(() => {
    if (activeTab !== HOME_TAB.CALLS) return;
    const { lastRoomId } = useRejoinStore.getState();
    if (!lastRoomId) return;
    api.rooms.checkAlive(lastRoomId).then(({ alive, userCount }) => {
      if (!alive) {
        useRejoinStore.setState({ lastRoomId: null, userCount: null });
      } else {
        useRejoinStore.setState({ userCount });
      }
    });
  }, [activeTab]);
}
