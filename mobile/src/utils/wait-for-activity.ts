import { NativeModules, DeviceEventEmitter } from 'react-native';

const { ActivityReady } = NativeModules;

/**
 * resolves immediately if the activity is already resumed.
 * subscribes before checking to close the race window.
 */
export function waitForActivity(): Promise<void> {
  return new Promise(resolve => {
    const subscription = DeviceEventEmitter.addListener('ActivityReady', () => {
      subscription.remove();
      resolve();
    });

    ActivityReady.isActivityReady().then((ready: boolean) => {
      if (ready) {
        subscription.remove();
        resolve();
      }
    });
  });
}
