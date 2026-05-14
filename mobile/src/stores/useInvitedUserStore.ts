import { createInvitedUserStore } from '../../../shared/stores/createInvitedUserStore';
import { mmkvStorage } from '../utils/mmkv';

export const useInvitedUserStore = createInvitedUserStore(mmkvStorage);
