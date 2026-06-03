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
import { CALL_OUTCOME } from '../../../../../../shared/constants/calls';
import { StyleSheet, View } from 'react-native';

const CALL_NOTIFICATION_TIMEOUT_MS = 60_000;

interface OtherPartyProps {
  roomId: RoomId;
}

export default function OtherParty({ roomId }: OtherPartyProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const callDismissalReason = useRoomStore(state => state.callDismissalReason);
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
    if (callDismissalReason === null) return;
    const timeout = setTimeout(() => {
      useInvitedUserStore.setState({ invitedUser: null });
      useRoomStore.setState({ callDismissalReason: null });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [callDismissalReason]);

  const handleCancelInvite = useCallback(async () => {
    const currentInvitedUser = useInvitedUserStore.getState().invitedUser;
    if (!currentInvitedUser) return;
    useInvitedUserStore.setState({ invitedUser: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
      await api.calls.markCancelled(currentInvitedUser.callId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  }, [roomId]);

  const handleInviteTimeout = useCallback(async () => {
    if (!useInvitedUserStore.getState().invitedUser) return;
    useRoomStore.setState({
      callDismissalReason: CALL_OUTCOME.NO_ANSWER,
    });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
    } catch (error) {
      console.error('Failed to cancel invite on timeout:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!invitedContact) return;
    const timeout = setTimeout(
      handleInviteTimeout,
      CALL_NOTIFICATION_TIMEOUT_MS,
    );
    return () => {
      clearTimeout(timeout);
      useInvitedUserStore.setState({ invitedUser: null });
      // server handles FCM cancellation on socket disconnect
    };
  }, [invitedContact, handleInviteTimeout]);

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
          useInvitedUserStore.setState({
            invitedUser: { roomId, callId, contact },
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
