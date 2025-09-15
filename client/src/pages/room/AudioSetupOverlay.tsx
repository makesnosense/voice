import { useState, useEffect } from 'react';

interface AudioSetupOverlayProps {
  onSetupComplete: () => void;
}

export default function AudioSetupOverlay({ onSetupComplete }: AudioSetupOverlayProps) {
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const requestMicrophone = async () => {
      try {
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        stream.getTracks().forEach(track => track.stop());

        setMicPermission('granted');
        setIsLoading(false);
        console.log('✅ Microphone access granted');

        // auto-proceed after short delay
        setTimeout(() => {
          onSetupComplete();
        }, 500);

      } catch (error) {
        console.error('❌ Microphone access denied:', error);
        setMicPermission('denied');
        setIsLoading(false);
      }
    };

    requestMicrophone();
  }, [onSetupComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Audio Setup</h3>

        {isLoading && <p>Requesting microphone access...</p>}

        {micPermission === 'granted' && (
          <p>✅ Microphone access granted!</p>
        )}

        {micPermission === 'denied' && (
          <>
            <p>❌ Microphone access denied</p>
            <p>Please enable microphone in your browser settings</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}