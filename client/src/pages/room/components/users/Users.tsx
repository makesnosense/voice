import { useEffect, useState } from 'react';
import { api } from '../../../../api';
import InviteCard from './invite-card/InviteCard';
import UserCard from './usercard/UserCard';
import { useWebRTCStore } from '../../../../../../shared/stores/useWebRTCStore';
import { useAudioAnalyserStore } from '../../../../stores/useAudioAnalyserStore';
import { useAuthStore } from '../../../../stores/useAuthStore';
import usersStyles from './Users.module.css';
import type { SocketId, AudioFrequencyData } from '../../../../../../shared/types/core';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import useRoomId from '../../useRoomId';
import CallingCard from './calling-card/CallingCard';
import type { InvitedContact } from '../../../../../../shared/types/contacts';

interface UsersProps {
  currentUserId: SocketId | undefined;
}

export default function Users({ currentUserId }: UsersProps) {
  const roomId = useRoomId();

  const [invitedContact, setInvitedContact] = useState<InvitedContact | null>(() => {
    const pending = useRoomStore.getState().pendingInvitedContact;
    console.log('Users mount, pendingInvitedContact:', pending);
    return pending;
  });

  useEffect(() => {
    useRoomStore.setState({ pendingInvitedContact: null });
  }, []);

  const roomUsers = useRoomStore((state) => state.roomUsers);
  const isCallDeclined = useRoomStore((state) => state.isCallDeclined);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);

  const handleCancelInvite = async () => {
    setInvitedContact(null);
    try {
      const token = await getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId!, token);
    } catch (error) {
      console.error('failed to cancel invite:', error);
    }
  };

  useEffect(() => {
    if (roomUsers.length >= 2) setInvitedContact(null);
  }, [roomUsers.length]);

  const isAlone = roomUsers.length === 1;

  useEffect(() => {
    if (!isCallDeclined) return;
    const timeout = setTimeout(() => {
      setInvitedContact(null);
      useRoomStore.setState({ isCallDeclined: false });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isCallDeclined]);
  return (
    <div className={usersStyles.usersContainer}>
      {roomUsers.map((user) => {
        const isCurrentUser = user.userId === currentUserId;
        const isRemoteUser = user.userId === remoteUserId;

        let getAudioData: (() => AudioFrequencyData) | undefined;
        let isUserAudioActive = false;

        if (isCurrentUser && isMicActive) {
          getAudioData = () => useAudioAnalyserStore.getState().getLocalAudioData();
          isUserAudioActive = !isMutedLocal;
        } else if (isRemoteUser) {
          getAudioData = () => useAudioAnalyserStore.getState().getRemoteAudioData();
          isUserAudioActive = !user.isMuted;
        }

        return (
          <UserCard
            key={user.userId}
            userId={user.userId}
            isCurrentUser={isCurrentUser}
            getAudioData={getAudioData}
            isAudioActive={isUserAudioActive}
            isMutedLocal={isCurrentUser ? isMutedLocal : undefined}
            onToggleMute={isCurrentUser ? toggleMute : undefined}
            isMicConnected={isCurrentUser ? isMicActive : undefined}
            isRemoteUserMuted={!isCurrentUser ? user.isMuted : undefined}
          />
        );
      })}

      {isAlone && isAuthenticated && !invitedContact && (
        <InviteCard roomId={roomId!} onUserInvited={(contact) => setInvitedContact(contact)} />
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
