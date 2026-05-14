import { createInvitedUserStore } from '../../../shared/stores/createInvitedUserStore';

export const useInvitedUserStore = createInvitedUserStore(localStorage);
