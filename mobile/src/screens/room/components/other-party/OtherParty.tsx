import { useCallback, useEffect } from 'react';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import { useInvitedUserStore } from '../../../../stores/useInvitedUserStore';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { api } from '../../../../api';
import RemoteUserCard from './RemoteUserCard';
import CallingCard from './calling-card/CallingCard';
import InviteCard from './invite-card/InviteCard';
import CopyCard from './CopyCard';
import type { RoomId } from '../../../../../../shared/types/core';
import { StyleSheet, View } from 'react-native';

const CALL_NOTIFICATION_TIMEOUT_MS = 60_000;

interface OtherPartyProps {
  roomId: RoomId;
}

export default function OtherParty({ roomId }: OtherPartyProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isCallDeclined = useRoomStore(state => state.isCallDeclined);
  const roomUsers = useRoomStore(state => state.roomUsers);
  const invitedUser = useInvitedUserStore(state => state.invitedUser);

  const invitedContact =
    invitedUser?.roomId === roomId ? invitedUser.contact : null;
  const isRemoteUserPresent = roomUsers.length >= 2;

  useEffect(() => {
    if (roomUsers.length >= 2) {
      useInvitedUserStore.setState({ invitedUser: null });
    }
  }, [roomUsers.length]);

  useEffect(() => {
    if (!isCallDeclined) return;
    const timeout = setTimeout(() => {
      useInvitedUserStore.setState({ invitedUser: null });
      useRoomStore.setState({ isCallDeclined: false });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isCallDeclined]);

  const handleCancelInvite = useCallback(async () => {
    const currentInvitedUser = useInvitedUserStore.getState().invitedUser;
    if (!currentInvitedUser) return;
    useInvitedUserStore.setState({ invitedUser: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!invitedContact) return;
    const timeout = setTimeout(
      handleCancelInvite,
      CALL_NOTIFICATION_TIMEOUT_MS,
    );
    return () => {
      clearTimeout(timeout);
      useInvitedUserStore.setState({ invitedUser: null });
      // server handler cleans up invite on socket disconnect
    };
  }, [invitedContact, handleCancelInvite]);

  if (isRemoteUserPresent) return <RemoteUserCard />;

  if (!isAuthenticated) {
    return (
      <>
        <View style={styles.unauthenticatedFiller} />
        <CopyCard roomId={roomId} />
      </>
    );
  }

  if (invitedContact) {
    return (
      <CallingCard
        contactName={invitedContact.name}
        contactEmail={invitedContact.email}
        isDeclined={isCallDeclined}
        onCancel={handleCancelInvite}
      />
    );
  }

  return (
    <>
      <InviteCard
        roomId={roomId}
        onUserInvited={contact =>
          useInvitedUserStore.setState({ invitedUser: { roomId, contact } })
        }
      />
      <CopyCard roomId={roomId} />
    </>
  );
}

const styles = StyleSheet.create({
  unauthenticatedFiller: {
    flex: 1,
  },
});
