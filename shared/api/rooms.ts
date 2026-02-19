import { ApiBase } from './base';
import type { CreateRoomResponse } from '../types';

export class RoomsApi extends ApiBase {
  createRoom(): Promise<CreateRoomResponse> {
    return this.apiFetch<CreateRoomResponse>('/rooms', { method: 'POST' });
  }
}
