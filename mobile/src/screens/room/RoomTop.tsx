import CallingCard from './components/calling-card/CallingCard';
import RemoteUserCard from './components/RemoteUserCard';
import InviteCard from './components/invite-card/InviteCard';
import CopyCard from './components/CopyCard';
import { useInvitedUserStore } from '../../stores/useInvitedUserStore';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../api';
import type { RoomId } from '../../../../shared/types/core';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native';
import ChatCard from './components/ChatCard';

interface RoomTopProps {
  roomId: RoomId;
}

export default function RoomTop({ roomId }: RoomTopProps) {
  const isCallDeclined = useRoomStore(state => state.isCallDeclined);
  const roomUsers = useRoomStore(state => state.roomUsers);
  const invitedUser = useInvitedUserStore(state => state.invitedUser);

  const invitedContact =
    invitedUser?.roomId === roomId ? invitedUser.contact : null;
  const isAlone = roomUsers.length === 1;

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

  const handleCancelInvite = async () => {
    useInvitedUserStore.setState({ invitedUser: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  };

  if (!isAlone) return <RemoteUserCard />;
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
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <InviteCard
        roomId={roomId}
        onUserInvited={contact =>
          useInvitedUserStore.setState({ invitedUser: { roomId, contact } })
        }
      />
      <CopyCard roomId={roomId} />
      <ChatCard />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
});
