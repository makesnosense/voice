import {
  WEBRTC_CONNECTION_STATE,
  type WebRTCConnectionState,
} from "../../../../WebRTCManager";
import connectionDotStyles from "./WebRTCConnectionStatusDot.module.css";

interface WebRTCConnectionStatusDotProps {
  state: WebRTCConnectionState | null;
}

export default function WebRTCConnectionStatusDot({
  state,
}: WebRTCConnectionStatusDotProps) {
  if (!state) {
    return null; // don't show before WebRTC initialized
  }

  const getStateClass = () => {
    switch (state) {
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
        return "";
    }
  };

  const getLabel = () => {
    switch (state) {
      case WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER:
        return "waiting";
      case WEBRTC_CONNECTION_STATE.CONNECTING:
        return "connecting";
      case WEBRTC_CONNECTION_STATE.CONNECTED:
        return "connected";
      case WEBRTC_CONNECTION_STATE.RECONNECTING:
        return "reconnecting";
      case WEBRTC_CONNECTION_STATE.FAILED:
        return "failed";
      default:
        return "";
    }
  };

  return (
    <div className={connectionDotStyles.container}>
      <div className={`${connectionDotStyles.dot} ${getStateClass()}`} />
      <span className={connectionDotStyles.label}>{getLabel()}</span>
    </div>
  );
}
