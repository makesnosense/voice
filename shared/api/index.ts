import { AuthApi } from './auth';
import { DevicesApi } from './devices';
import { RoomsApi } from './rooms';
import { ContactsApi } from './contacts';
import { CallsApi } from './calls';
import { UsersApi } from './users';

export class Api {
  readonly auth: AuthApi;
  readonly devices: DevicesApi;
  readonly rooms: RoomsApi;
  readonly contacts: ContactsApi;
  readonly calls: CallsApi;
  readonly users: UsersApi;

  constructor(baseUrl: string) {
    this.auth = new AuthApi(baseUrl);
    this.devices = new DevicesApi(baseUrl);
    this.rooms = new RoomsApi(baseUrl);
    this.contacts = new ContactsApi(baseUrl);
    this.calls = new CallsApi(baseUrl);
    this.users = new UsersApi(baseUrl);
  }
}
