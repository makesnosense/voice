const REFRESH_TOKEN_LOCAL_STORAGE_KEY = 'refresh_token';

export const localStorageAuthStorage = {
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, token),
  clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY),
};

// still exported for useDeviceRegistration which reads localStorage directly
export { REFRESH_TOKEN_LOCAL_STORAGE_KEY };
