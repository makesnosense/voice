import { AuthApi } from './auth';
import { DevicesApi } from './devices';
import { RoomsApi } from './rooms';
import { ContactsApi } from './contacts';
import { CallApi } from './call';

export class Api {
  readonly auth: AuthApi;
  readonly devices: DevicesApi;
  readonly rooms: RoomsApi;
  readonly contacts: ContactsApi;
  readonly call: CallApi;

  constructor(baseUrl: string) {
    this.auth = new AuthApi(baseUrl);
    this.devices = new DevicesApi(baseUrl);
    this.rooms = new RoomsApi(baseUrl);
    this.contacts = new ContactsApi(baseUrl);
    this.call = new CallApi(baseUrl);
  }
}
