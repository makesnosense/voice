import 'react-native-webrtc';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
global.RTCPeerConnection = RTCPeerConnection;
global.RTCSessionDescription = RTCSessionDescription;
global.RTCIceCandidate = RTCIceCandidate;
import { AppRegistry } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, queryPersister } from './src/query-client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './src/App';
import { name as appName } from './app.json';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { installLogger } from './src/utils/logger';

installLogger();
setBackgroundMessageHandler(getMessaging(), async () => {});

const Root = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: queryPersister,
      maxAge: Infinity,
      buster: '1',
    }}
  >
    <SafeAreaProvider>
      <KeyboardProvider>
        <App />
      </KeyboardProvider>
    </SafeAreaProvider>
  </PersistQueryClientProvider>
);

AppRegistry.registerComponent(appName, () => Root);
