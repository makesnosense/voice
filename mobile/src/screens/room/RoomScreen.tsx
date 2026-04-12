import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InCallManager from 'react-native-incall-manager';
import { revokeLockScreenBypass } from '../../native/lock-screen-bypass';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useRejoinStore } from '../../stores/useRejoinStore';
import { useAuthStore } from '../../stores/useAuthStore';
import useWebRTCInit from '../../hooks/useWebRTCInit';
import { api } from '../../api';
import { BASE_URL } from '../../config';
import {
  startCallForegroundService,
  stopCallForegroundService,
} from '../../native/call-foreground-service';
import SelfCard from './components/SelfCard';
import CopyCard from './components/CopyCard';
import RemoteUserCard from './components/RemoteUserCard';
import CallingCard from './components/calling-card/CallingCard';
import InviteCard from './components/invite-card/InviteCard';
import type { InvitedContact } from '../../../../shared/types/contacts';
import type { RoomId } from '../../../../shared/types/core';

interface RoomScreenProps {
  roomId: RoomId;
  onLeave: () => void;
}

const handleDisconnect = () => {
  useWebRTCStore.getState().cleanup();
};

const handleCleanup = () => {
  useWebRTCStore.getState().cleanup();
  useMicrophoneStore.getState().cleanup();
};

const handleJoinSuccess = (roomId: RoomId) => {
  useRejoinStore.setState({ lastRoomId: roomId });
};

export default function RoomScreen({ roomId, onLeave }: RoomScreenProps) {
  const roomUsers = useRoomStore(state => state.roomUsers);
  const isCallDeclined = useRoomStore(state => state.isCallDeclined);
  const isAlone = roomUsers.length === 1;

  const [invitedContact, setInvitedContact] = useState<InvitedContact | null>(
    null,
  );

  const requestMicrophone = useMicrophoneStore(
    state => state.requestMicrophone,
  );

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  const socketRef = useRoomSocket(
    roomId,
    handleDisconnect,
    handleCleanup,
    handleJoinSuccess,
    BASE_URL,
  );

  useWebRTCInit(socketRef);

  useEffect(() => {
    startCallForegroundService();
    InCallManager.start({ media: 'audio' });
    InCallManager.setForceSpeakerphoneOn(false);
    return () => {
      stopCallForegroundService();
      InCallManager.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeLockScreenBypass();
    };
  }, []);

  useEffect(() => {
    if (roomUsers.length >= 2) setInvitedContact(null);
  }, [roomUsers.length]);

  useEffect(() => {
    if (!isCallDeclined) return;
    const timeout = setTimeout(() => {
      setInvitedContact(null);
      useRoomStore.setState({ isCallDeclined: false });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isCallDeclined]);

  const handleCancelInvite = async () => {
    setInvitedContact(null);
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.cancelInviteToRoom(roomId, token);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  };

  const renderTopSlot = () => {
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
      <View style={styles.aloneTopSlot}>
        <InviteCard roomId={roomId} onUserInvited={setInvitedContact} />
        <CopyCard roomId={roomId} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topSlot}>{renderTopSlot()}</View>

      <SelfCard onLeave={onLeave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    justifyContent: 'space-between',
  },
  topSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  aloneTopSlot: {
    gap: 12,
  },
});
