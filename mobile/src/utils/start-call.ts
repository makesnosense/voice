import { useAuthStore } from '../stores/useAuthStore';
import { useCallHistoryStore } from '../stores/useCallHistoryStore';
import { api } from '../api';
import { CALL_DIRECTION } from '../../../shared/constants/calls';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';

interface CallTarget {
  contactId: string;
  contactEmail: string;
  contactName: string | null;
}

export async function startCall(target: CallTarget) {
  try {
    const token = await useAuthStore.getState().getValidAccessToken();
    const { roomId } = await api.calls.create(target.contactId, token);
    useCallHistoryStore.getState().prependEntry({
      direction: CALL_DIRECTION.OUTGOING,
      contactId: target.contactId,
      contactEmail: target.contactEmail,
      contactName: target.contactName,
      contactHasMobileDevice: true,
    });
    useActiveRoomStore.setState({ activeRoomId: roomId });
  } catch (error) {
    console.error('❌ Failed to start call:', error);
  }
}
