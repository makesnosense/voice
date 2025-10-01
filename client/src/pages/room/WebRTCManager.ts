import AudioAnalyser from './AudioAnalyser';
import type {
  TypedSocket, SocketId, IceCandidate,
  WebRTCOffer, WebRTCAnswer, AudioFrequencyData
} from '../../../../shared/types';

const BASE_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: `stun:${import.meta.env.VITE_TURN_SERVER_HOST}:${import.meta.env.VITE_TURN_SERVER_PORT}` }
];

export const DisconnectReason = {
  PEER_LEFT: 'peer-left',
  CONNECTION_FAILED: 'connection-failed',
  ICE_FAILED: 'ice-failed',
  NETWORK_ERROR: 'network-error',
  MANUAL_CLEANUP: 'manual-cleanup'
} as const;


export type DisconnectReason = typeof DisconnectReason[keyof typeof DisconnectReason];

export class WebRTCManager {
  private localStream: MediaStream;
  private peerConnection: RTCPeerConnection | null = null;
  private socket: TypedSocket;
  private currentRemoteUserId: SocketId | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // these are for audio analysis
  private audioContext: AudioContext;
  private localAnalyser: AudioAnalyser;
  private remoteAnalyser: AudioAnalyser | null = null;

  // callbacks for UI updates
  private onStreamAdded: (userId: SocketId, stream: MediaStream) => void;
  private onStreamRemoved: (reason: DisconnectReason) => void;

  constructor(
    socket: TypedSocket,
    passedMicStream: MediaStream,
    onStreamAdded: (userId: SocketId, stream: MediaStream) => void,
    onStreamRemoved: (reason: DisconnectReason) => void,
  ) {
    this.socket = socket;
    this.localStream = passedMicStream;
    this.onStreamAdded = onStreamAdded;
    this.onStreamRemoved = onStreamRemoved;

    // initialize audio analysis
    this.audioContext = new AudioContext();
    this.localAnalyser = new AudioAnalyser(this.audioContext, this.localStream);

    this.setupSocketListeners();
  }

  private async createPeerConnection(remoteUserId: SocketId): Promise<RTCPeerConnection> {
    console.log(`🔗 [WebRTC] Creating peer connection to ${remoteUserId}`);
    this.currentRemoteUserId = remoteUserId;
    const iceServers = await this.getIceServers();
    const peerConnection = new RTCPeerConnection({ iceServers });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // registering handler that fires when LOCAL RTCPeerConnection discovers a new network path
    // (ICE candidate) that remote peer can use to reach us
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 [WebRTC] sending ICE candidate to ${remoteUserId}`);
        this.socket.emit('webrtc-ice-candidate', {
          candidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid
          },
          toUserId: remoteUserId
        });
      } else {
        console.log(`🧊 [WebRTC] ICE gathering completed`);
      }
    };

    // ice connection state monitoring
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log(`🧊 [WebRTC] ICE connection state: ${iceState}`);

      if (iceState === 'failed') {
        console.error(`❌ [WebRTC] ICE connection failed`);
        this.handleConnectionFailed(DisconnectReason.ICE_FAILED);
      } else if (iceState === 'disconnected') {
        console.warn(`⚠️ [WebRTC] ICE disconnected (might reconnect)`);
      } else if (iceState === 'closed') {
        console.log(`🔒 [WebRTC] ICE connection closed`);
      }
    };


    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`📶 [WebRTC] peer connection state: ${state}`);

      if (state === 'connected') {
        console.log(`✅ [WebRTC] peer connection established successfully`);
        this.reconnectAttempts = 0;
      } else if (state === 'failed') {
        console.error(`❌ [WebRTC] peer connection failed`);
        this.handleConnectionFailed(DisconnectReason.CONNECTION_FAILED);
      } else if (state === 'disconnected') {
        console.warn(`⚠️ [WebRTC] peer connection disconnected`);
        this.handlePeerDisconnect(DisconnectReason.NETWORK_ERROR);
      } else if (state === 'closed') {
        console.log(`🔒 [WebRTC] peer connection closed`);
      }
    };

    // handle incoming audio stream from remote peer
    peerConnection.ontrack = (event) => {
      console.log(`🎵 [WebRTC] received remote stream from ${remoteUserId}`);
      const [remoteStream] = event.streams;

      this.remoteAnalyser = new AudioAnalyser(this.audioContext, remoteStream);
      console.log(`🎤 [WebRTC] set up remote audio analysis for ${remoteUserId}`);

      this.onStreamAdded(remoteUserId, remoteStream);
    };

    this.peerConnection = peerConnection;
    return peerConnection;
  }

  private async getIceServers(): Promise<RTCIceServer[]> {
    const iceServers = [...BASE_ICE_SERVERS];

    try {
      const response = await fetch('/api/turn-credentials');
      const turn_credentials = await response.json();

      iceServers.push({
        urls: `turn:${import.meta.env.VITE_TURN_SERVER_HOST}:${import.meta.env.VITE_TURN_SERVER_PORT}`,
        username: turn_credentials.username,
        credential: turn_credentials.credential
      });

      console.log('✅ [WebRTC] TURN credentials obtained');
    } catch (error) {
      console.error('❌ [WebRTC] failed to get TURN credentials:', error);
      console.log('⚠️ [WebRTC] using STUN only (may not work behind strict NAT)');
    }

    return iceServers;
  }

  private setupSocketListeners() {
    // second user joins - we initiate
    this.socket.on('initiate-webrtc-call', async (remoteUserId: SocketId) => {
      console.log(`👋 [Socket] second user ${remoteUserId} joined - initiating WebRTC call`);
      await this.initiateCall(remoteUserId);
    });

    // we are second user - handle incoming offer
    this.socket.on('webrtc-offer', async (data: { fromUserId: SocketId; offer: WebRTCOffer; }) => {
      console.log(`📞 [Socket] received WebRTC offer from ${data.fromUserId}`);
      await this.handleOffer(data.fromUserId, data.offer);
    });

    // we initiated - handle answer
    this.socket.on('webrtc-answer', async (data: { fromUserId: SocketId; answer: WebRTCAnswer; }) => {
      console.log(`✅ [Socket] received WebRTC answer from ${data.fromUserId}`);
      await this.handleAnswer(data.fromUserId, data.answer);
    });

    // ice candidates
    this.socket.on('webrtc-ice-candidate', async (data: { fromUserId: SocketId; candidate: IceCandidate; }) => {
      console.log(`🧊 [Socket] received ICE candidate from ${data.fromUserId}`);
      await this.handleIceCandidate(data.candidate);
    });

    // socket-level user left (not webrtc disconnect)
    this.socket.on('user-left', (userId: SocketId) => {
      console.log(`👋 [Socket] user ${userId} left the room (socket disconnect)`);
      this.handlePeerDisconnect(DisconnectReason.PEER_LEFT);
    });
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
          type: offer.type as 'offer'
        },
        toUserId: remoteUserId
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

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log(`📤 [WebRTC] sending answer to ${fromUserId}`);
      this.socket.emit('webrtc-answer', {
        answer: {
          sdp: answer.sdp!,
          type: answer.type as 'answer'
        },
        toUserId: fromUserId
      });
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle offer:', error);
    }
  }

  // we are the user that initiated the call and we handle the answer to our offer
  private async handleAnswer(fromUserId: SocketId, answer: WebRTCAnswer) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ [WebRTC] call established with ${fromUserId}`);
      }
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle answer:', error);
    }
  }

  // asynchronously handling ice candidates
  private async handleIceCandidate(candidate: IceCandidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('❌ [WebRTC] failed to handle ICE candidate:', error);
    }
  }

  private get inputAudioEnabled(): boolean {
    if (!this.localStream) return false;
    return this.localStream.getAudioTracks().some(track => track.enabled);
  }

  get isMuted(): boolean {
    return !this.inputAudioEnabled;
  }


  getAudioFrequencyData(): AudioFrequencyData {
    if (!this.localAnalyser || !this.localStream) {
      return { bands: [0, 0, 0, 0, 0], overallLevel: 0 };
    }

    if (!this.inputAudioEnabled) {
      return { bands: [0, 0, 0, 0, 0], overallLevel: 0 };
    }

    return this.localAnalyser.getFrequencyData();
  }

  getRemoteAudioFrequencyData(): AudioFrequencyData {
    if (!this.remoteAnalyser) {
      return { bands: [0, 0, 0, 0, 0], overallLevel: 0 };
    }

    return this.remoteAnalyser.getFrequencyData();
  }


  getAudioLevel(): number {
    return this.getAudioFrequencyData().overallLevel;
  }


  toggleMute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });

      this.localAnalyser.setActive(this.inputAudioEnabled);

      console.log(`🔇 [WebRTC] mute status changed: ${this.isMuted ? 'muted' : 'unmuted'}`);
      this.socket.emit('mute-status-changed', { isMuted: this.isMuted });
    }
  }

  private async handleConnectionFailed(reason: DisconnectReason) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 [WebRTC] retrying connection ${this.reconnectAttempts}/${this.maxReconnectAttempts} (reason: ${reason})`);

      this.closePeerConnection(reason);

      await new Promise(resolve => setTimeout(resolve, 1000));

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
      this.peerConnection.close();
      this.peerConnection = null;
      this.onStreamRemoved(reason);
    }

    // cleanup remote audio analysis
    if (this.remoteAnalyser) {
      this.remoteAnalyser.cleanup();
      this.remoteAnalyser = null;
    }
  }


  cleanup() {
    console.log('🧹 [WebRTC] cleanup initiated');

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 [WebRTC] stopped local track: ${track.kind}`);
      });
    }

    if (this.audioContext) {
      this.audioContext.close();
      console.log('🔇 [WebRTC] closed audio context');
    }

    if (this.localAnalyser) {
      this.localAnalyser.cleanup();
    }

    this.closePeerConnection(DisconnectReason.MANUAL_CLEANUP);
  }

}