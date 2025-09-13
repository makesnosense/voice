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

  // this for audio analysis
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // Callbacks for UI updates
  private onStreamAdded: (userId: SocketId, stream: MediaStream) => void;
  private onStreamRemoved: (userId: SocketId) => void;

  constructor(
    socket: TypedSocket,
    onStreamAdded: (userId: SocketId, stream: MediaStream) => void,
    onStreamRemoved: (userId: SocketId) => void
  ) {
    this.socket = socket;
    this.onStreamAdded = onStreamAdded;
    this.onStreamRemoved = onStreamRemoved;

    // this.setupSocketListeners();
  }


  // Step 1: Get user's microphone
  async initializeUserMedia(): Promise<void> {
    try {
      console.log('🎤 Requesting microphone access...');

      // Request only audio for now (we can add video later)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        // {
        //   echoCancellation: true,
        //   noiseSuppression: true,
        //   autoGainControl: true
        // }
        video: false
      });

      // Setup analyser for audio levels
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      source.connect(this.analyser);
      this.analyser.fftSize = 256;

      console.log('✅ Microphone access granted');
      // Log audio track settings
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

  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    let count = 0;

    for (let i = 0; i < dataArray.length; i++) {

      if (dataArray[i] > 10) {
        sum += dataArray[i];
        count++;
      }
    }


    if (count === 0) return 0;

    const average = sum / count;

    return Math.min(100, (average / 255) * 400);
  }

  toggleMute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  }


  // // Step 2: Create a peer connection for a specific user
  // private createPeerConnection(userId: SocketId): RTCPeerConnection {
  //   console.log(`🔗 Creating peer connection for ${userId}`);

  //   const pc = new RTCPeerConnection(ICE_SERVERS);

  //   // Add our local audio stream to the connection
  //   if (this.localStream) {
  //     this.localStream.getTracks().forEach(track => {
  //       pc.addTrack(track, this.localStream!);
  //     });
  //   }

  //   // Handle incoming audio stream from remote peer
  //   pc.ontrack = (event) => {
  //     console.log(`🎵 Received remote stream from ${userId}`);
  //     const [remoteStream] = event.streams;
  //     this.onStreamAdded(userId, remoteStream);
  //   };

  //   // Handle ICE candidates (network path discovery)
  //   pc.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       console.log(`🧊 Sending ICE candidate to ${userId}`);
  //       this.socket.emit('webrtc-ice-candidate', {
  //         candidate: {
  //           candidate: event.candidate.candidate,
  //           sdpMLineIndex: event.candidate.sdpMLineIndex,
  //           sdpMid: event.candidate.sdpMid
  //         },
  //         toUserId: userId
  //       });
  //     }
  //   };

  //   // Monitor connection state
  //   pc.onconnectionstatechange = () => {
  //     console.log(`📶 Connection state with ${userId}: ${pc.connectionState}`);

  //     if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
  //       this.handlePeerDisconnect(userId);
  //     }
  //   };

  //   this.peerConnections.set(userId, pc);
  //   return pc;
  // }


  // private setupSocketListeners() {
  //   // We'll implement this next
  // }

  // private handlePeerDisconnect(userId: SocketId) {
  //   console.log(`👋 Peer ${userId} disconnected`);
  //   this.closePeerConnection(userId);
  // }

  // private closePeerConnection(userId: SocketId) {
  //   const pc = this.peerConnections.get(userId);
  //   if (pc) {
  //     pc.close();
  //     this.peerConnections.delete(userId);
  //     this.onStreamRemoved(userId);
  //   }
  // }

  // Cleanup method
  cleanup() {
    // Stop local stream
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

    // Close all peer connections
    // this.peerConnections.forEach((pc, userId) => {
    //   this.closePeerConnection(userId);
    // });
  }

}