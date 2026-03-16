import { createAuthStore } from '../../../shared/stores/createAuthStore';
import { keychainStorage } from '../utils/keychain';
import { api } from '../api';

export const useAuthStore = createAuthStore(keychainStorage, api);
