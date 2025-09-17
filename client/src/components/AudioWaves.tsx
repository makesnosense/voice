import { useEffect, useState } from 'react';
import type { AudioFrequencyData } from '../../../shared/types';
import audioWavesStyles from './AudioWaves.module.css';

interface AudioWavesProps {
  audioData: AudioFrequencyData;
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function AudioWaves({
  audioData,
  isActive,
  size = 'medium'
}: AudioWavesProps) {
  // smooth the transitions to avoid jittery bars
  const [smoothedBands, setSmoothedBands] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!isActive) {
      setSmoothedBands([0, 0, 0, 0, 0]);
      return;
    }

    // simple exponential smoothing
    const smoothingFactor = 0.3;
    setSmoothedBands(prev =>
      audioData.bands.map((current, i) =>
        prev[i] * (1 - smoothingFactor) + current * smoothingFactor
      )
    );
  }, [audioData.bands, isActive]);

  const sizeClass = audioWavesStyles[size];

  return (
    <div className={`${audioWavesStyles.audioWaves} ${sizeClass}`}>
      {smoothedBands.map((level, i) => (
        <div
          key={i}
          className={`${audioWavesStyles.wave} ${!isActive ? audioWavesStyles.inactive : ''}`}
          style={{
            height: `${Math.max(20, level)}%`, // minimum 20% height
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}