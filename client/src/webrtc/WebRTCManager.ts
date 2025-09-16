import type { TypedSocket, SocketId, IceCandidate, WebRTCOffer, WebRTCAnswer } from '../../../shared/types';


const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<SocketId, RTCPeerConnection> = new Map();
  private socket: TypedSocket;

  // these are for audio analysis
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // callbacks for UI updates
  private onStreamAdded: (userId: SocketId, stream: MediaStream) => void;
  private onStreamRemoved: (userId: SocketId) => void;

  constructor(
    socket: TypedSocket,
    onStreamAdded: (userId: SocketId, stream: MediaStream) => void,
    onStreamRemoved: (userId: SocketId) => void) {
    this.socket = socket;
    this.onStreamAdded = onStreamAdded;
    this.onStreamRemoved = onStreamRemoved;

    this.setupSocketListeners();
  }

  async initializeUserMedia(): Promise<void> {
    try {
      console.log('🎤 Getting microphone access (permission already granted)...');

      // request only audio for now (we can add video later)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        // {
        //   echoCancellation: true,
        //   noiseSuppression: true,
        //   autoGainControl: true
        // }
        video: false
      });

      // setup analyser for audio levels
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      source.connect(this.analyser);
      this.analyser.fftSize = 256;

      console.log('✅ Microphone stream ready for WebRTC');
      // log audio track settings
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('🔊 Audio track enabled:', audioTrack.enabled);
        console.log('🎚️ Audio track settings:', audioTrack.getSettings());
      }
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      throw error;
    }
  }

  private createPeerConnection(remoteUserId: SocketId): RTCPeerConnection {
    console.log(`🔗 Creating peer connection to ${remoteUserId}`);

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

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
        this.handlePeerDisconnect(remoteUserId);
      }
    };

    // handle incoming audio stream from remote peer
    peerConnection.ontrack = (event) => {
      console.log(`🎵 Received remote stream from ${remoteUserId}`);
      const [remoteStream] = event.streams;
      this.onStreamAdded(remoteUserId, remoteStream);
    };

    this.peerConnections.set(remoteUserId, peerConnection);
    return peerConnection;
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
      await this.handleIceCandidate(data.fromUserId, data.candidate);
    });

    this.socket.on('user-left', (userId: SocketId) => {
      console.log(`👋 User ${userId} left`);
      this.handlePeerDisconnect(userId);
    });
  }

  // we are first user and initiate the call when second user joins
  // offer is created here
  private async initiateCall(remoteUserId: SocketId) {
    try {
      const peerConnection = this.createPeerConnection(remoteUserId);
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
      const peerConnection = this.createPeerConnection(fromUserId);
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
      const peerConnection = this.peerConnections.get(fromUserId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ Call established with ${fromUserId}`);
      }
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
    }
  }

  // asynchronously handling ice candidates
  private async handleIceCandidate(fromUserId: SocketId, candidate: IceCandidate) {
    try {
      const peerConnection = this.peerConnections.get(fromUserId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
    }
  }


  getAudioLevel(): number {
    if (!this.analyser || !this.localStream) return 0;

    const audioTracks = this.localStream.getAudioTracks();
    const isAudioEnabled = audioTracks.some(track => track.enabled);

    if (!isAudioEnabled) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // focus on voice frequency range (roughly 300Hz - 3000Hz)
    const sampleRate = this.audioContext?.sampleRate || 48000;
    const binSize = sampleRate / (this.analyser.fftSize * 2);

    const startBin = Math.floor(300 / binSize);  // ~300Hz
    const endBin = Math.floor(3000 / binSize);   // ~3000Hz

    const noiseThreshold = 25;
    let sum = 0;
    let count = 0;

    // only analyze voice frequency range
    for (let i = startBin; i < Math.min(endBin, dataArray.length); i++) {
      if (dataArray[i] > noiseThreshold) {
        sum += Math.pow(dataArray[i] - noiseThreshold, 1.5); // Exponential scaling
        count++;
      }
    }

    if (count === 0) return 0;

    const average = sum / count;
    return Math.min(100, Math.sqrt(average) * 3); // Square root for more natural scaling
  }

  toggleMute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }

  private handlePeerDisconnect(userId: SocketId) {
    console.log(`👋 Peer ${userId} disconnected`);
    this.closePeerConnection(userId);
  }

  private closePeerConnection(userId: SocketId) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
      this.onStreamRemoved(userId);
    }
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 Stopped track:', track.kind);
      });
      this.localStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }

    this.peerConnections.forEach((peerConnection, userId) => {
      this.closePeerConnection(userId);
    });
  }

}