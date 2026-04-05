import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
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

type LocationState = { calledContactEmail?: string } | null;

interface UsersProps {
  currentUserId: SocketId | undefined;
}

const getCalledContactEmail = (state: unknown): string | null =>
  (state as LocationState)?.calledContactEmail ?? null;

export default function Users({ currentUserId }: UsersProps) {
  const roomId = useRoomId();
  const location = useLocation();

  const [emailToInvite, calledContactEmail] = useState<string | null>(() =>
    getCalledContactEmail(location.state)
  );

  const roomUsers = useRoomStore((state) => state.roomUsers);
  const isCallDeclined = useRoomStore((state) => state.isCallDeclined);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);

  useEffect(() => {
    if (roomUsers.length >= 2) {
      calledContactEmail(null);
    }
  }, [roomUsers.length]);

  const isAlone = roomUsers.length === 1;

  useEffect(() => {
    if (!isCallDeclined) return;
    window.history.replaceState({}, '');
    const timeout = setTimeout(() => {
      calledContactEmail(null);
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

      {isAlone && isAuthenticated && !emailToInvite && (
        <InviteCard roomId={roomId!} onUserInvited={(email) => calledContactEmail(email)} />
      )}

      {isAlone && emailToInvite && (
        <CallingCard
          email={emailToInvite}
          onCancel={() => calledContactEmail(null)}
          declined={isCallDeclined}
        />
      )}
    </div>
  );
}
