import { WEBRTC_CONNECTION_STATE } from '../../../../../../../../shared/constants/webrtc';
import connectionDotStyles from './WebRTCConnectionStatusDot.module.css';
import { useWebRTCStore } from '../../../../../../../../shared/stores/useWebRTCStore';

export default function WebRTCConnectionStatusDot() {
  const webRTCConnectionState = useWebRTCStore((state) => state.webRTCConnectionState);
  if (!webRTCConnectionState) {
    return null; // don't show before WebRTC initialized
  }

  const getStateClass = () => {
    switch (webRTCConnectionState) {
      case WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER:
        return connectionDotStyles.waiting;
      case WEBRTC_CONNECTION_STATE.CONNECTING:
        return connectionDotStyles.connecting;
      case WEBRTC_CONNECTION_STATE.CONNECTED:
        return connectionDotStyles.connected;
      case WEBRTC_CONNECTION_STATE.RECONNECTING:
        return connectionDotStyles.reconnecting;
      case WEBRTC_CONNECTION_STATE.FAILED:
        return connectionDotStyles.failed;
      default:
        return '';
    }
  };

  const getLabel = () => {
    switch (webRTCConnectionState) {
      case WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER:
        return 'waiting';
      case WEBRTC_CONNECTION_STATE.CONNECTING:
        return 'connecting';
      case WEBRTC_CONNECTION_STATE.CONNECTED:
        return 'connected';
      case WEBRTC_CONNECTION_STATE.RECONNECTING:
        return 'reconnecting';
      case WEBRTC_CONNECTION_STATE.FAILED:
        return 'failed';
      default:
        return '';
    }
  };

  return (
    <div className={connectionDotStyles.container}>
      <div className={`${connectionDotStyles.dot} ${getStateClass()}`} />
      <span className={connectionDotStyles.label}>{getLabel()}</span>
    </div>
  );
}
