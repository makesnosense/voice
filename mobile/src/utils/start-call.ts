import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';
import { useInvitedUserStore } from '../stores/useInvitedUserStore';
import { queryClient } from '../query-client';
import { callHistoryQueryOptions } from '../queries/call-history';

interface CallTarget {
  contactId: string;
  contactEmail: string;
  contactName: string | null;
}

export async function startCall(target: CallTarget) {
  try {
    const token = await useAuthStore.getState().getValidAccessToken();
    const { roomId } = await api.calls.create(target.contactId, token);
    queryClient.invalidateQueries({
      queryKey: callHistoryQueryOptions.queryKey,
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
