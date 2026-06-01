import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';
import { useInvitedUserStore } from '../stores/useInvitedUserStore';
import { prependCallHistoryEntry } from '../queries/call-history';
import { CALL_DIRECTION } from '../../../shared/constants/calls';

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
      contactId: target.contactId,
      contactEmail: target.contactEmail,
      contactName: target.contactName,
      contactHasMobileDevice: true,
    });

    useInvitedUserStore.setState({
      invitedUser: {
        roomId,
        contact: { email: target.contactEmail, name: target.contactName },
      },
    });
    useActiveRoomStore.setState({ activeRoomId: roomId });
  } catch (error) {
    console.error('❌ Failed to start call:', error);
  }
}
