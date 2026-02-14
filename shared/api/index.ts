import { AuthApi } from './auth';
import { DevicesApi } from './devices';
import { RoomsApi } from './rooms';

export class Api {
  readonly auth: AuthApi;
  readonly devices: DevicesApi;
  readonly rooms: RoomsApi;

  constructor(baseUrl: string) {
    this.auth = new AuthApi(baseUrl);
    this.devices = new DevicesApi(baseUrl);
    this.rooms = new RoomsApi(baseUrl);
  }
}
