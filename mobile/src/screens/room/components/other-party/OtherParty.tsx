import { useCallback, useEffect } from 'react';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { api } from '../../../../api';
import RemoteUserCard from './RemoteUserCard';
import CallingCard from './calling-card/CallingCard';
import InviteCard from './invite-card/InviteCard';
import CopyCard from './CopyCard';
import type { RoomId } from '../../../../../../shared/types/core';
import { StyleSheet, View } from 'react-native';

interface OtherPartyProps {
  roomId: RoomId;
}

export default function OtherParty({ roomId }: OtherPartyProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const callDismissalReason = useRoomStore(state => state.callDismissalReason);
  const roomUsers = useRoomStore(state => state.roomUsers);
  const invitedUser = useRoomStore(state => state.invitedUser);

  const isRemoteUserPresent = roomUsers.length >= 2;

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

  const handleCancelInvite = useCallback(async () => {
    const currentInvitedUser = useRoomStore.getState().invitedUser;
    if (!currentInvitedUser) return;
    useRoomStore.setState({ invitedUser: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
      await api.calls.markCancelled(currentInvitedUser.callId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  }, [roomId]);

  if (isRemoteUserPresent) return <RemoteUserCard />;

  if (!isAuthenticated) {
    return (
      <>
        <View style={styles.unauthenticatedFiller} />
        <CopyCard roomId={roomId} />
      </>
    );
  }

  if (invitedUser) {
    return (
      <CallingCard
        contactName={invitedUser.name}
        contactEmail={invitedUser.email}
        callDismissalReason={callDismissalReason}
        onCancel={handleCancelInvite}
      />
    );
  }

  return (
    <>
      <InviteCard
        roomId={roomId}
        onUserInvited={(contact, callId) =>
          useRoomStore.setState({
            invitedUser: { email: contact.email, name: contact.name, callId },
          })
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
