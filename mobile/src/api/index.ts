import { Api } from '../../../shared/api/';

const API_BASE_URL = __DEV__
  ? 'https://localhost:3003/api'
  : 'https://voice.k.vu/api';

export const api = new Api(API_BASE_URL);
