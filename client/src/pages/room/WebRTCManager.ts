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

export class WebRTCManager {
  private localStream: MediaStream;
  private peerConnection: RTCPeerConnection | null = null;
  private socket: TypedSocket;

  // these are for audio analysis
  private audioContext: AudioContext;
  private localAnalyser: AudioAnalyser;
  private remoteAnalyser: AudioAnalyser | null = null;

  // callbacks for UI updates
  private onStreamAdded: (userId: SocketId, stream: MediaStream) => void;
  private onStreamRemoved: () => void;

  constructor(
    socket: TypedSocket,
    passedMicStream: MediaStream,
    onStreamAdded: (userId: SocketId, stream: MediaStream) => void,
    onStreamRemoved: () => void,
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
    console.log(`🔗 Creating peer connection to ${remoteUserId}`);

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
        console.log(`🧊 Sending ICE candidate to ${remoteUserId}`);
        this.socket.emit('webrtc-ice-candidate', {
          candidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid
          },
          toUserId: remoteUserId
        });
      }
    };


    peerConnection.onconnectionstatechange = () => {
      console.log(`📶 Connection state with ${remoteUserId}: ${peerConnection.connectionState}`);

      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        this.handlePeerDisconnect();
      }
    };

    // handle incoming audio stream from remote peer
    peerConnection.ontrack = (event) => {
      console.log(`🎵 Received remote stream from ${remoteUserId}`);
      const [remoteStream] = event.streams;

      this.remoteAnalyser = new AudioAnalyser(this.audioContext, remoteStream);
      console.log(`🎤 Set up remote audio analysis for ${remoteUserId}`);

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

      console.log('✅ TURN credentials obtained');
    } catch (error) {
      console.error(error);
      console.log('⚠️ TURN credentials unavailable, using STUN only');
    }

    return iceServers;
  }

  private setupSocketListeners() {
    // the most important one
    // when second user joins and is webrtc-ready
    this.socket.on('initiate-webrtc-call', async (remoteUserId: SocketId) => {
      console.log(`👋 Second user ${remoteUserId} joined - I'm initiating the call...`);
      await this.initiateCall(remoteUserId);
    });

    // if we are that second user that joined the room, we receive the offer
    this.socket.on('webrtc-offer', async (data: { fromUserId: SocketId; offer: WebRTCOffer; }) => {
      console.log(`📞 Received call offer from ${data.fromUserId}`);
      await this.handleOffer(data.fromUserId, data.offer);
    });

    // we are the user that initiated the call and we handle the answer to our offer
    this.socket.on('webrtc-answer', async (data: { fromUserId: SocketId; answer: WebRTCAnswer; }) => {
      console.log(`✅ Received call answer from ${data.fromUserId}`);
      await this.handleAnswer(data.fromUserId, data.answer);
    });

    // asynchronously handle incoming ice candidates
    this.socket.on('webrtc-ice-candidate', async (data: { fromUserId: SocketId; candidate: IceCandidate; }) => {
      console.log(`🧊 Received ICE candidate from ${data.fromUserId}`);
      await this.handleIceCandidate(data.candidate);
    });

    this.socket.on('user-left', (userId: SocketId) => {
      console.log(`👋 User ${userId} left`);
      this.handlePeerDisconnect();
    });
  }

  // we are first user and initiate the call when second user joins
  // offer is created here
  private async initiateCall(remoteUserId: SocketId) {
    try {
      const peerConnection = await this.createPeerConnection(remoteUserId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log(`📤 Sending offer to ${remoteUserId}`);
      this.socket.emit('webrtc-offer', {
        offer: {
          sdp: offer.sdp!,
          type: offer.type as 'offer'
        },
        toUserId: remoteUserId
      });
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
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

      console.log(`📤 Sending answer to ${fromUserId}`);
      this.socket.emit('webrtc-answer', {
        answer: {
          sdp: answer.sdp!,
          type: answer.type as 'answer'
        },
        toUserId: fromUserId
      });
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
    }
  }

  // we are the user that initiated the call and we handle the answer to our offer
  private async handleAnswer(fromUserId: SocketId, answer: WebRTCAnswer) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ Call established with ${fromUserId}`);
      }
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
    }
  }

  // asynchronously handling ice candidates
  private async handleIceCandidate(candidate: IceCandidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
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

      // emit mute status change to server
      console.log(`🔇 Emitting mute status change: ${this.isMuted ? 'muted' : 'unmuted'}`);
      this.socket.emit('mute-status-changed', { isMuted: this.isMuted });
    }
  }

  private handlePeerDisconnect() {
    console.log(`👋 Peer disconnected`);
    this.closePeerConnection();
  }


  private closePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      this.onStreamRemoved();
    }

    // cleanup remote audio analysis
    if (this.remoteAnalyser) {
      this.remoteAnalyser.cleanup();
      this.remoteAnalyser = null;
    }
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    if (this.localAnalyser) {
      this.localAnalyser.cleanup();
    }

    this.closePeerConnection();
  }

}