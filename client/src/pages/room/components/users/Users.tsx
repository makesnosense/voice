import { useCallback, useEffect } from 'react';
import { api } from '../../../../api';
import InviteCard from './invite-card/InviteCard';
import UserCard from './usercard/UserCard';
import { useWebRTCStore } from '../../../../../../shared/stores/useWebRTCStore';
import { useAudioAnalyserStore } from '../../../../stores/useAudioAnalyserStore';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import usersStyles from './Users.module.css';
import useRoomId from '../../useRoomId';
import CallingCard from './calling-card/CallingCard';
import { formatDisplayName } from '../../../../../../shared/utils/format';
import type { AudioFrequencyData } from '../../../../../../shared/types/core';

export default function Users() {
  const roomId = useRoomId();

  const localSocketId = useRoomStore((state) => state.localSocketId);
  const invitedUser = useRoomStore((state) => state.invitedUser);
  const roomUsers = useRoomStore((state) => state.roomUsers);
  const callDismissalReason = useRoomStore((state) => state.callDismissalReason);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteSocketId = useWebRTCStore((state) => state.remoteSocketId);

  const handleCancelInvite = useCallback(async () => {
    const currentInvitedUser = useRoomStore.getState().invitedUser;
    if (!currentInvitedUser) return;
    useRoomStore.setState({ invitedUser: null });
    try {
      const token = await getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId!, token);
      await api.calls.markCancelled(currentInvitedUser.callId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  }, [roomId, getValidAccessToken]);

  useEffect(() => {
    if (roomUsers.length >= 2) {
      useRoomStore.setState({ invitedUser: null });
    }
  }, [roomUsers.length]);

  useEffect(() => {
    if (callDismissalReason === null) return;
    const timeout = setTimeout(() => {
      useRoomStore.setState({ invitedUser: null, callDismissalReason: null });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [callDismissalReason]);

  const isAlone = roomUsers.length === 1;

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

      {isAlone && isAuthenticated && !invitedUser && (
        <InviteCard
          roomId={roomId!}
          onUserInvited={(contact, callId) =>
            useRoomStore.setState({
              invitedUser: { email: contact.email, name: contact.name, callId },
            })
          }
        />
      )}

      {isAlone && invitedUser && (
        <CallingCard
          contactEmail={invitedUser.email}
          contactName={invitedUser.name}
          onCancel={handleCancelInvite}
          callDismissalReason={callDismissalReason}
        />
      )}
    </div>
  );
}
