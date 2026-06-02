import { useCallback, useEffect } from 'react';
import { api } from '../../../../api';
import InviteCard from './invite-card/InviteCard';
import UserCard from './usercard/UserCard';
import { useWebRTCStore } from '../../../../../../shared/stores/useWebRTCStore';
import { useAudioAnalyserStore } from '../../../../stores/useAudioAnalyserStore';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import { useInvitedUserStore } from '../../../../stores/useInvitedUserStore';
import usersStyles from './Users.module.css';
import useRoomId from '../../useRoomId';
import CallingCard from './calling-card/CallingCard';
import { formatDisplayName } from '../../../../../../shared/utils/format';
import type { AudioFrequencyData } from '../../../../../../shared/types/core';
import { CALL_OUTCOME } from '../../../../../../shared/constants/calls';

const CALL_NOTIFICATION_TIMEOUT_MS = 60_000;

export default function Users() {
  const roomId = useRoomId();

  const localSocketId = useRoomStore((state) => state.localSocketId);
  const invitedUser = useInvitedUserStore((state) => state.invitedUser);
  const invitedContact = invitedUser?.roomId === roomId ? invitedUser.contact : null;

  const roomUsers = useRoomStore((state) => state.roomUsers);

  const callDismissalReason = useRoomStore((state) => state.callDismissalReason);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteSocketId = useWebRTCStore((state) => state.remoteSocketId);

  const handleCancelInvite = useCallback(async () => {
    const currentInvitedUser = useInvitedUserStore.getState().invitedUser;
    if (!currentInvitedUser) return;
    useInvitedUserStore.setState({ invitedUser: null });
    try {
      const token = await getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId!, token);
    } catch (error) {
      console.error('failed to cancel invite:', error);
    }
  }, [roomId, getValidAccessToken]);

  useEffect(() => {
    if (roomUsers.length >= 2) {
      useInvitedUserStore.setState({ invitedUser: null });
    }
  }, [roomUsers.length]);

  const isAlone = roomUsers.length === 1;

  useEffect(() => {
    if (callDismissalReason === null) return;
    const timeout = setTimeout(() => {
      useInvitedUserStore.setState({ invitedUser: null });
      useRoomStore.setState({ callDismissalReason: null });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [callDismissalReason]);

  const handleInviteTimeout = useCallback(async () => {
    if (!useInvitedUserStore.getState().invitedUser) return;
    useRoomStore.setState({ callDismissalReason: CALL_OUTCOME.NO_ANSWER });
    try {
      const token = await getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId!, token);
    } catch (error) {
      console.error('failed to cancel invite on timeout:', error);
    }
  }, [roomId, getValidAccessToken]);

  useEffect(() => {
    if (!invitedContact) return;
    const timeout = setTimeout(handleInviteTimeout, CALL_NOTIFICATION_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
      useInvitedUserStore.setState({ invitedUser: null });
      // server handles FCM cancellation on socket disconnect
    };
  }, [invitedContact, handleInviteTimeout]);

  return (
    <div className={usersStyles.usersContainer}>
      {roomUsers.map((user) => {
        const isLocalUser = user.socketId === localSocketId;
        const isRemoteUser = user.socketId === remoteSocketId;

        const displayName = isLocalUser ? 'You' : formatDisplayName(user.name, user.email);

        let getAudioData: (() => AudioFrequencyData) | undefined;
        let isUserAudioActive = false;

        if (isLocalUser && isMicActive) {
          getAudioData = () => useAudioAnalyserStore.getState().getLocalAudioData();
          isUserAudioActive = !isMutedLocal;
        } else if (isRemoteUser) {
          getAudioData = () => useAudioAnalyserStore.getState().getRemoteAudioData();
          isUserAudioActive = !user.isMuted;
        }

        return (
          <UserCard
            key={user.socketId}
            displayName={displayName}
            isCurrentUser={isLocalUser}
            getAudioData={getAudioData}
            isAudioActive={isUserAudioActive}
            isMutedLocal={isLocalUser ? isMutedLocal : undefined}
            onToggleMute={isLocalUser ? toggleMute : undefined}
            isMicConnected={isLocalUser ? isMicActive : undefined}
            isRemoteUserMuted={!isLocalUser ? user.isMuted : undefined}
          />
        );
      })}

      {isAlone && isAuthenticated && !invitedContact && (
        <InviteCard
          roomId={roomId!}
          onUserInvited={(contact) =>
            useInvitedUserStore.setState({ invitedUser: { roomId: roomId!, contact } })
          }
        />
      )}

      {isAlone && invitedContact && (
        <CallingCard
          contact={invitedContact}
          onCancel={handleCancelInvite}
          callDismissalReason={callDismissalReason}
        />
      )}
    </div>
  );
}
