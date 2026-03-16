import { createAuthStore } from '../../../shared/stores/createAuthStore';
import { localStorageAuthStorage } from '../utils/auth-storage';
import { api } from '../api';

export const useAuthStore = createAuthStore(localStorageAuthStorage, api);
