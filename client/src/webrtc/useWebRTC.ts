import { useEffect, useRef, useState } from 'react';
import { WebRTCManager } from './WebRTCManager';
import type { TypedSocket } from '../../../shared/types';

export default function useWebRTC(socket: TypedSocket | null, shouldInitWebRTC: boolean) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const animationRef = useRef<number>(0);

  const toggleMute = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleMute();
      setIsMuted(!isMuted);
    }
  };


  useEffect(() => {
    // Only init when we have socket AND should init (after room join)
    if (!socket || !shouldInitWebRTC) return;



    const initWebRTC = async () => {

      try {
        console.log('🎬 Starting WebRTC initialization...');
        const manager = new WebRTCManager(socket, () => { }, () => { });

        webrtcRef.current = manager;

        await manager.initializeUserMedia();

        setIsMicActive(true);



        // Simple audio level monitoring
        const checkAudio = () => {
          const level = manager.getAudioLevel();
          setAudioLevel(level);
          animationRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();

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
    };
  }, [socket, shouldInitWebRTC]);

  return { isMicActive, audioLevel, isMuted, toggleMute };
}