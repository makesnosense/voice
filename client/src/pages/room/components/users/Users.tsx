import { useEffect, useState } from 'react';
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

interface UsersProps {
  currentUserId: SocketId | undefined;
}

export default function Users({ currentUserId }: UsersProps) {
  const roomId = useRoomId();

  const [emailToInvite, setEmailToInvite] = useState<string | null>(null);

  const roomUsers = useRoomStore((state) => state.roomUsers);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);

  useEffect(() => {
    if (roomUsers.length >= 2) {
      setEmailToInvite(null);
    }
  }, [roomUsers.length]);

  const isAlone = roomUsers.length === 1;

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

      {isAlone && isAuthenticated && !emailToInvite && (
        <InviteCard roomId={roomId!} onUserInvited={(email) => setEmailToInvite(email)} />
      )}

      {isAlone && emailToInvite && (
        <CallingCard email={emailToInvite} onCancel={() => setEmailToInvite(null)} />
      )}
    </div>
  );
}
