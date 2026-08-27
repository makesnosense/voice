import { waitForActivity } from '../utils/wait-for-activity';
import { createPermissionsStore } from './createPermissionsStore';

export const usePermissionsStore = createPermissionsStore(waitForActivity);
