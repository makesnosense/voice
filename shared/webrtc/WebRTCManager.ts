import {
  WEBRTC_CONNECTION_STATE,
  ICE_CONNECTION_STATE,
  PEER_CONNECTION_STATE,
  type WebRTCConnectionState,
} from '../constants/webrtc';
import { DISCONNECT_REASON, type DisconnectReason } from '../constants/webrtc';
import type {
  TypedClientSocket,
  SocketId,
  IceCandidate,
  WebRTCOffer,
  WebRTCAnswer,
} from '../types';

const BASE_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

export class WebRTCManager {
  private localStream: MediaStream;
  private peerConnection: RTCPeerConnection | null = null;
  private socket: TypedClientSocket;
  private currentRemoteUserId: SocketId | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isInitiator: boolean = false;

  private pendingCandidates: IceCandidate[] = [];
  private remoteDescriptionSet: boolean = false;

  private onStreamAdded: (userId: SocketId, stream: MediaStream) => void;
  private onStreamRemoved: (reason: DisconnectReason) => void;

  // callback to update WebRTCState in Zustand
  private onConnectionStateChange: (state: WebRTCConnectionState) => void;

  private turnServerConfig: {
    credentialsUrl: string;
    host: string;
    port: string;
  };

  // only on web
  private analyserCallbacks?: {
    onLocalStream: (stream: MediaStream) => void;
    onRemoteStream: (stream: MediaStream) => void;
  };

  private readonly socketHandlers = {
    // second user joins - we initiate
    initiateWebRTCCall: async (remoteUserId: SocketId) => {
      this.isInitiator = true;
      console.log(`👋 [Socket] second user ${remoteUserId} joined - initiating WebRTC call`);
      await this.initiateCall(remoteUserId);
    },
    // we are second user - handle incoming offer
    webRTCOffer: async (data: { fromUserId: SocketId; offer: WebRTCOffer }) => {
      console.log(`📞 [Socket] received WebRTC offer from ${data.fromUserId}`);
      this.isInitiator = false;
      await this.handleOffer(data.fromUserId, data.offer);
    },
    // we initiated - handle answer
    webRTCAnswer: async (data: { fromUserId: SocketId; answer: WebRTCAnswer }) => {
      console.log(`✅ [Socket] received WebRTC answer from ${data.fromUserId}`);
      await this.handleAnswer(data.fromUserId, data.answer);
    },
    webRTCIceCandidate: async (data: { fromUserId: SocketId; candidate: IceCandidate }) => {
      console.log(`🧊 [Socket] received ICE candidate from ${data.fromUserId}`);
      await this.handleIceCandidate(data.candidate);
    },
    // socket-level user left (not webrtc disconnect)
    userLeft: (userId: SocketId) => {
      console.log(`👋 [Socket] user ${userId} left the room (socket disconnect)`);
      this.handlePeerDisconnect(DISCONNECT_REASON.PEER_LEFT);
    },
  };

  constructor(
    socket: TypedClientSocket,
    passedMicStream: MediaStream,
    onStreamAdded: (userId: SocketId, stream: MediaStream) => void,
    onStreamRemoved: (reason: DisconnectReason) => void,
    onConnectionStateChange: (state: WebRTCConnectionState) => void,
    turnServerConfig: {
      credentialsUrl: string;
      host: string;
      port: string;
    },
    analyserCallbacks?: {
      onLocalStream: (stream: MediaStream) => void;
      onRemoteStream: (stream: MediaStream) => void;
    }
  ) {
    this.socket = socket;
    this.localStream = passedMicStream;
    this.onStreamAdded = onStreamAdded;
    this.onStreamRemoved = onStreamRemoved;
    this.onConnectionStateChange = onConnectionStateChange;

    this.turnServerConfig = turnServerConfig;

    this.analyserCallbacks = analyserCallbacks;
    this.analyserCallbacks?.onLocalStream(this.localStream);

    this.setupSocketListeners();
  }

  private async createPeerConnection(remoteUserId: SocketId): Promise<RTCPeerConnection> {
    console.log(`🔗 [WebRTC] Creating peer connection to ${remoteUserId}`);
    this.currentRemoteUserId = remoteUserId;
    const iceServers = await this.getIceServers();
    const peerConnection = new RTCPeerConnection({ iceServers });

    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream!);
    });

    // registering handler that fires when LOCAL RTCPeerConnection discovers a new network path
    // (ICE candidate) that remote peer can use to reach us
    peerConnection.onicecandidate = (event) => {
      if (peerConnection !== this.peerConnection) return;
      if (event.candidate && event.candidate.candidate !== '') {
        console.log(
          `🧊 [WebRTC] LOCAL candidate: ${event.candidate.type} ${event.candidate.address}:${event.candidate.port} ${event.candidate.protocol}`
        );
        console.log(`🧊 [WebRTC] sending ICE candidate to ${remoteUserId}`);
        this.socket.emit('webrtc-ice-candidate', {
          candidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
          },
          toUserId: remoteUserId,
        });
      } else {
        console.log(`🧊 [WebRTC] ICE gathering completed`);
      }
    };

    // ice connection state monitoring
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection !== this.peerConnection) return;
      const iceState = peerConnection.iceConnectionState;
      console.log(`🧊 [WebRTC] ICE connection state changed: ${iceState}`);

      if (iceState === ICE_CONNECTION_STATE.FAILED) {
        console.error(`❌ [WebRTC] ICE connection failed`);
        // this.handleConnectionFailed(DISCONNECT_REASON.ICE_FAILED);
      } else if (iceState === ICE_CONNECTION_STATE.DISCONNECTED) {
        console.warn(`⚠️ [WebRTC] ICE disconnected - waiting for reconnection...`);
        // DO NOTHING - let ICE try to reconnect
      } else if (
        iceState === ICE_CONNECTION_STATE.CONNECTED ||
        iceState === ICE_CONNECTION_STATE.COMPLETED
      ) {
        console.log(`✅ [WebRTC] ICE connected successfully`);
        this.reconnectAttempts = 0;
      } else if (iceState === ICE_CONNECTION_STATE.CLOSED) {
        console.log(`🔒 [WebRTC] ICE connection closed`);
      }

      this.onConnectionStateChange(this.getWebRtcConnectionState());
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection !== this.peerConnection) return;
      const state = peerConnection.connectionState;
      console.log(`📶 [WebRTC] peer connection state changed to: ${state}`);

      if (state === PEER_CONNECTION_STATE.CONNECTED) {
        console.log(`✅ [WebRTC] peer connection established successfully`);
        this.reconnectAttempts = 0;
      } else if (state === PEER_CONNECTION_STATE.FAILED) {
        console.error(`❌ [WebRTC] peer connection failed`);
        this.handleConnectionFailed(DISCONNECT_REASON.CONNECTION_FAILED);
      } else if (state === PEER_CONNECTION_STATE.DISCONNECTED) {
        console.warn(`⚠️ [WebRTC] peer connection disconnected - waiting for reconnection...`);
        // DO NOTHING - WebRTC will try to reconnect automatically
        // ICE will keep working to find new routes
      } else if (state === PEER_CONNECTION_STATE.CLOSED) {
        console.log(`🔒 [WebRTC] peer connection closed`);
        // connection was intentionally closed, clean up
        this.closePeerConnection(DISCONNECT_REASON.MANUAL_CLEANUP);
      }

      this.onConnectionStateChange(this.getWebRtcConnectionState());
    };

    // handle incoming audio stream from remote peer
    peerConnection.ontrack = (event) => {
      if (peerConnection !== this.peerConnection) return;
      console.log(`🎵 [WebRTC] received remote stream from ${remoteUserId}`);
      const [remoteStream] = event.streams;

      this.onStreamAdded(remoteUserId, remoteStream);
      this.analyserCallbacks?.onRemoteStream(remoteStream);
    };

    this.peerConnection = peerConnection;
    return peerConnection;
  }

  private async getIceServers(): Promise<RTCIceServer[]> {
    const iceServers = [...BASE_ICE_SERVERS];

    try {
      const response = await fetch(this.turnServerConfig.credentialsUrl);
      const turn_credentials = await response.json();

      iceServers.push({
        urls: [
          `turn:${this.turnServerConfig.host}:${this.turnServerConfig.port}?transport=tcp`,
          `turn:${this.turnServerConfig.host}:${this.turnServerConfig.port}?transport=udp`,
        ],
        username: turn_credentials.username,
        credential: turn_credentials.credential,
      });

      console.log('✅ [WebRTC] TURN credentials obtained');
    } catch (error) {
      console.error('❌ [WebRTC] failed to get TURN credentials:', error);
      console.log('⚠️ [WebRTC] using STUN only (may not work behind strict NAT)');
    }

    return iceServers;
  }

  private setupSocketListeners() {
    this.socket.on('initiate-webrtc-call', this.socketHandlers.initiateWebRTCCall);
    this.socket.on('webrtc-offer', this.socketHandlers.webRTCOffer);
    this.socket.on('webrtc-answer', this.socketHandlers.webRTCAnswer);
    this.socket.on('webrtc-ice-candidate', this.socketHandlers.webRTCIceCandidate);
    this.socket.on('user-left', this.socketHandlers.userLeft);
  }

  private removeSocketListeners() {
    this.socket.off('initiate-webrtc-call', this.socketHandlers.initiateWebRTCCall);
    this.socket.off('webrtc-offer', this.socketHandlers.webRTCOffer);
    this.socket.off('webrtc-answer', this.socketHandlers.webRTCAnswer);
    this.socket.off('webrtc-ice-candidate', this.socketHandlers.webRTCIceCandidate);
    this.socket.off('user-left', this.socketHandlers.userLeft);
  }

  // we are first user and initiate the call when second user joins
  // offer is created here
  private async initiateCall(remoteUserId: SocketId) {
    try {
      const peerConnection = await this.createPeerConnection(remoteUserId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log(`📤 [WebRTC] sending offer to ${remoteUserId}`);
      this.socket.emit('webrtc-offer', {
        offer: {
          sdp: offer.sdp!,
          type: offer.type as 'offer',
        },
        toUserId: remoteUserId,
      });
    } catch (error) {
      console.error('❌ [WebRTC] failed to initiate call:', error);
    }
  }

  // we are second user that joined the room, we receive the offer and handle it
  // by creating answer
  private async handleOffer(fromUserId: SocketId, offer: WebRTCOffer) {
    try {
      const peerConnection = await this.createPeerConnection(fromUserId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      this.remoteDescriptionSet = true;

      // drain buffered candidates
      await this.processPendingCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log(`📤 [WebRTC] sending answer to ${fromUserId}`);
      this.socket.emit('webrtc-answer', {
        answer: {
          sdp: answer.sdp!,
          type: answer.type as 'answer',
        },
        toUserId: fromUserId,
      });
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle offer:', error);
    }
  }

  // we are the user that initiated the call and we handle the answer to our offer
  private async handleAnswer(fromUserId: SocketId, answer: WebRTCAnswer) {
    try {
      if (!this.peerConnection) return;

      if (this.peerConnection.signalingState !== 'have-local-offer') {
        console.warn(`⚠️ [WebRTC] Ignoring stale answer`);
        return;
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

      this.remoteDescriptionSet = true;
      await this.processPendingCandidates();

      console.log(`✅ [WebRTC] call established with ${fromUserId}`);
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle answer:', error);
    }
  }

  // asynchronously handling ice candidates
  private async handleIceCandidate(candidate: IceCandidate) {
    try {
      console.log(`🧊 [WebRTC] REMOTE candidate: ${candidate.candidate}`);
      // buffer if peer connection doesn't exist yet
      if (!this.peerConnection) {
        console.log(`📦 [WebRTC] buffering ICE candidate (no peer connection yet)`);
        this.pendingCandidates.push(candidate);
        return;
      }

      // buffer if remote description not set yet (spec requirement)
      if (!this.remoteDescriptionSet) {
        console.log(`📦 [WebRTC] buffering candidate (no remote description yet)`);
        this.pendingCandidates.push(candidate);
        return;
      }

      // both conditions met - add immediately
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`✅ [WebRTC] added ICE candidate`);
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle ICE candidate:', error);
    }
  }

  private async processPendingCandidates() {
    if (this.pendingCandidates.length === 0) return;

    console.log(`🔄 [WebRTC] processing ${this.pendingCandidates.length} buffered candidates`);

    for (const candidate of this.pendingCandidates) {
      try {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('❌ [WebRTC] failed to add buffered candidate:', error);
      }
    }

    this.pendingCandidates = [];
  }

  private get inputAudioEnabled(): boolean {
    if (!this.localStream) return false;
    return this.localStream.getAudioTracks().some((track) => track.enabled);
  }

  get isMuted(): boolean {
    return !this.inputAudioEnabled;
  }

  toggleMute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      console.log(`🔇 [WebRTC] mute status changed: ${this.isMuted ? 'muted' : 'unmuted'}`);
      this.socket.emit('mute-status-changed', { isMuted: this.isMuted });
    }
  }

  private async handleConnectionFailed(reason: DisconnectReason) {
    if (!this.isInitiator) {
      console.log(`⏳ [WebRTC] Not initiator, waiting for peer to reconnect`);
      this.closePeerConnection(reason);
      return;
    }
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 [WebRTC] retrying connection ${this.reconnectAttempts}/${this.maxReconnectAttempts} (reason: ${reason})`
      );

      this.closePeerConnection(reason);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (this.currentRemoteUserId) {
        await this.initiateCall(this.currentRemoteUserId);
      } else {
        console.error('❌ [WebRTC] no remote user id for reconnection');
        this.closePeerConnection(reason);
      }
    } else {
      console.error(`❌ [WebRTC] max reconnection attempts reached (reason: ${reason})`);
      this.closePeerConnection(reason);
    }
  }

  private handlePeerDisconnect(reason: DisconnectReason) {
    console.log(`👋 [WebRTC] peer disconnected (reason: ${reason})`);
    this.closePeerConnection(reason);
  }

  private closePeerConnection(reason: DisconnectReason) {
    if (this.peerConnection) {
      console.log(`🔌 [WebRTC] closing peer connection (reason: ${reason})`);
      const pc = this.peerConnection;
      this.peerConnection = null;
      pc.close();
      this.onConnectionStateChange(this.getWebRtcConnectionState());

      this.remoteDescriptionSet = false;
      this.pendingCandidates = [];

      this.onStreamRemoved(reason);
    }
  }

  getWebRtcConnectionState(): WebRTCConnectionState {
    if (!this.peerConnection) {
      return WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER;
    }

    const connState: RTCPeerConnectionState = this.peerConnection.connectionState;
    const iceState: RTCIceConnectionState = this.peerConnection.iceConnectionState;

    // truly connected
    if (
      connState === PEER_CONNECTION_STATE.CONNECTED &&
      (iceState === ICE_CONNECTION_STATE.CONNECTED || iceState === ICE_CONNECTION_STATE.COMPLETED)
    ) {
      return WEBRTC_CONNECTION_STATE.CONNECTED;
    }

    // actively trying to recover
    if (
      iceState === ICE_CONNECTION_STATE.DISCONNECTED ||
      iceState === ICE_CONNECTION_STATE.CHECKING
    ) {
      return WEBRTC_CONNECTION_STATE.CONNECTING;
    }

    // gave up
    if (
      connState === PEER_CONNECTION_STATE.FAILED ||
      iceState === ICE_CONNECTION_STATE.FAILED ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return WEBRTC_CONNECTION_STATE.FAILED;
    }

    // still establishing initial connection
    return WEBRTC_CONNECTION_STATE.CONNECTING;
  }

  cleanup() {
    console.log('🧹 [WebRTC] cleanup initiated');
    this.removeSocketListeners();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 [WebRTC] stopped local track: ${track.kind}`);
      });
    }
    this.closePeerConnection(DISCONNECT_REASON.MANUAL_CLEANUP);
  }
}
