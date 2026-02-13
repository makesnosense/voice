import { AuthApi } from './auth';
import { DevicesApi } from './devices';

export class Api {
  readonly auth: AuthApi;
  readonly devices: DevicesApi;

  constructor(baseUrl: string) {
    this.auth = new AuthApi(baseUrl);
    this.devices = new DevicesApi(baseUrl);
  }
}
