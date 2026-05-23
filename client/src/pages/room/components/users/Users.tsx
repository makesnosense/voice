import { useEffect } from 'react';
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

export default function Users() {
  const roomId = useRoomId();

  const localSocketId = useRoomStore((state) => state.localSocketId);
  const invitedUser = useInvitedUserStore((state) => state.invitedUser);
  const invitedContact = invitedUser?.roomId === roomId ? invitedUser.contact : null;

  const roomUsers = useRoomStore((state) => state.roomUsers);
  const isCallDeclined = useRoomStore((state) => state.isCallDeclined);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteSocketId = useWebRTCStore((state) => state.remoteSocketId);

  const handleCancelInvite = async () => {
    useInvitedUserStore.setState({ invitedUser: null });
    try {
      const token = await getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId!, token);
    } catch (error) {
      console.error('failed to cancel invite:', error);
    }
  };

  useEffect(() => {
    if (roomUsers.length >= 2) {
      useInvitedUserStore.setState({ invitedUser: null });
    }
  }, [roomUsers.length]);

  const isAlone = roomUsers.length === 1;

  useEffect(() => {
    if (!isCallDeclined) return;
    const timeout = setTimeout(() => {
      useInvitedUserStore.setState({ invitedUser: null });
      useRoomStore.setState({ isCallDeclined: false });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isCallDeclined]);

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
          declined={isCallDeclined}
        />
      )}
    </div>
  );
}
