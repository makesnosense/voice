import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';
import { useRoomStore } from '../../../shared/stores/useRoomStore';
import { prependCallHistoryEntry } from '../queries/call-history';
import { CALL_DIRECTION, CALL_OUTCOME } from '../../../shared/constants/calls';

interface CallTarget {
  contactId: string;
  contactEmail: string;
  contactName: string | null;
  contactHasMobileDevice: boolean;
}

export async function startCall(target: CallTarget) {
  try {
    const token = await useAuthStore.getState().getValidAccessToken();
    const { roomId, callId } = await api.calls.create(target.contactId, token);

    prependCallHistoryEntry({
      id: callId,
      createdAt: new Date().toISOString(),
      direction: CALL_DIRECTION.OUTGOING,
      outcome: CALL_OUTCOME.NO_ANSWER,
      contactId: target.contactId,
      contactEmail: target.contactEmail,
      contactName: target.contactName,
      contactHasMobileDevice: true,
    });

    useRoomStore.setState({
      invitedUser: {
        email: target.contactEmail,
        name: target.contactName,
        callId,
      },
    });
    useActiveRoomStore.setState({ activeRoomId: roomId });
  } catch (error) {
    console.error('❌ Failed to start call:', error);
  }
}
