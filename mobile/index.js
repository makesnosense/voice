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
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './src/App';
import { name as appName } from './app.json';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { queryClient } from './src/query-client';
import { installLogger } from './src/utils/logger';

installLogger();
setBackgroundMessageHandler(getMessaging(), async () => {});

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <SafeAreaProvider>
      <KeyboardProvider>
        <App />
      </KeyboardProvider>
    </SafeAreaProvider>
  </QueryClientProvider>
);

AppRegistry.registerComponent(appName, () => Root);
