import { useEffect, useRef } from 'react';
import type { AudioFrequencyData } from '../../../../../../shared/types';
import audioWavesStyles from './AudioWaves.module.css';

interface AudioWavesProps {
  getAudioData: () => AudioFrequencyData;
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function AudioWaves({ getAudioData, isActive, size = 'medium' }: AudioWavesProps) {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const smoothedBands = useRef<number[]>([0, 0, 0, 0, 0]);
  const rafIdRef = useRef<number>(null);
  const getAudioDataRef = useRef(getAudioData);
  const isActiveRef = useRef(isActive);

  // keep refs in sync with props
  useEffect(() => {
    isActiveRef.current = isActive;
    getAudioDataRef.current = getAudioData;
  }, [isActive, getAudioData]);

  useEffect(() => {
    const animate = () => {
      if (!isActiveRef.current) {
        smoothedBands.current = [0, 0, 0, 0, 0];
        waveRefs.current.forEach((ref) => {
          if (ref) ref.style.height = '20%';
        });
      } else {
        const data = getAudioDataRef.current();
        const smoothingFactor = 0.3;
        data.bands.forEach((current, i) => {
          smoothedBands.current[i] =
            smoothedBands.current[i] * (1 - smoothingFactor) + current * smoothingFactor;
          const ref = waveRefs.current[i];
          if (ref) ref.style.height = `${Math.max(20, smoothedBands.current[i])}%`;
        });
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const sizeClass = audioWavesStyles[size];

  return (
    <div className={`${audioWavesStyles.audioWaves} ${sizeClass}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          ref={(htmlElement) => {
            waveRefs.current[i] = htmlElement;
          }}
          className={`${audioWavesStyles.wave} ${!isActive ? audioWavesStyles.inactive : ''}`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: '20%', // initial height
          }}
        />
      ))}
    </div>
  );
}
