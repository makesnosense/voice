import { useEffect, useRef, useState } from 'react';
import { WebRTCManager } from './WebRTCManager';
import type { TypedSocket, SocketId, AudioFrequencyData } from '../../../shared/types';

export default function useWebRTC(socket: TypedSocket | null, shouldInitWebRTC: boolean) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioFrequencyData, setAudioFrequencyData] = useState<AudioFrequencyData>({
    bands: [0, 0, 0, 0, 0],
    overallLevel: 0
  });
  const [remoteStreams, setRemoteStreams] = useState<Map<SocketId, MediaStream>>(new Map());

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const animationRef = useRef<number>(0);


  const toggleMute = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleMute();
      setIsMuted(!isMuted);
    }
  };

  const handleStreamAdded = (remoteUserId: SocketId, stream: MediaStream) => {
    console.log('🎵 Adding remote stream for user:', remoteUserId);
    setRemoteStreams(prev => new Map(prev).set(remoteUserId, stream));
  };

  const handleStreamRemoved = (remoteUserId: SocketId) => {
    console.log('🔇 Removing remote stream for user:', remoteUserId);
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(remoteUserId);
      return newMap;
    });
  };


  useEffect(() => {
    // only init when we have socket AND should init (after room join)
    if (!socket || !shouldInitWebRTC) return;



    const initWebRTC = async () => {

      try {
        console.log('🎬 Starting WebRTC initialization...');
        const manager = new WebRTCManager(socket, handleStreamAdded, handleStreamRemoved);

        webrtcRef.current = manager;

        await manager.initializeUserMedia();

        setIsMicActive(true);



        // Simple audio level monitoring
        const checkAudio = () => {
          const frequencyData = manager.getAudioFrequencyData();
          setAudioFrequencyData(frequencyData);
          setAudioLevel(frequencyData.overallLevel); // keep for compatibility
          animationRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();

        // WebRTC is ready - emit directly to server
        console.log('✅ WebRTC ready, emitting audio-ready to server');
        socket.emit('webrtc-ready');


      } catch (error) {
        console.error('WebRTC init failed:', error);
        setIsMicActive(false);
      }
    };

    initWebRTC();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (webrtcRef.current) {
        webrtcRef.current.cleanup();
        webrtcRef.current = null;
      }
      setIsMicActive(false);
      setAudioLevel(0);
      setAudioFrequencyData({ bands: [0, 0, 0, 0, 0], overallLevel: 0 });
    };
  }, [socket, shouldInitWebRTC]);

  return {
    isMicActive,
    audioLevel,
    audioFrequencyData,
    isMuted,
    toggleMute,
    remoteStreams
  };
}