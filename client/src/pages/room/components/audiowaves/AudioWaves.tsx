import { useEffect, useRef } from "react";
import type { AudioFrequencyData } from "../../../../../../shared/types";
import audioWavesStyles from "./AudioWaves.module.css";

interface AudioWavesProps {
  audioData: AudioFrequencyData;
  isActive: boolean;
  size?: "small" | "medium" | "large";
}

export default function AudioWaves({
  audioData,
  isActive,
  size = "medium",
}: AudioWavesProps) {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const smoothedBands = useRef<number[]>([0, 0, 0, 0, 0]);
  const rafIdRef = useRef<number>(null);
  const audioDataRef = useRef(audioData);
  const isActiveRef = useRef(isActive);

  // keep refs in sync with props
  useEffect(() => {
    audioDataRef.current = audioData;
    isActiveRef.current = isActive;
  }, [audioData, isActive]);

  useEffect(() => {
    // visual update loop - runs independently of React renders
    const animate = () => {
      const currentActive = isActiveRef.current;
      const currentData: AudioFrequencyData = audioDataRef.current;

      if (!currentActive) {
        smoothedBands.current = [0, 0, 0, 0, 0];

        waveRefs.current.forEach((ref: HTMLDivElement | null) => {
          if (ref) ref.style.height = "20%"; // minimum 20% height
        });
      } else {
        // smooth and update DOM directly
        const smoothingFactor = 0.3;
        currentData.bands.forEach((current, i) => {
          smoothedBands.current[i] =
            smoothedBands.current[i] * (1 - smoothingFactor) +
            current * smoothingFactor;

          const ref = waveRefs.current[i];
          if (ref) {
            ref.style.height = `${Math.max(20, smoothedBands.current[i])}%`;
          }
        });
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []); // only run once on mount

  const sizeClass = audioWavesStyles[size];

  return (
    <div className={`${audioWavesStyles.audioWaves} ${sizeClass}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          ref={(htmlElement) => {
            waveRefs.current[i] = htmlElement;
          }}
          className={`${audioWavesStyles.wave} ${
            !isActive ? audioWavesStyles.inactive : ""
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: "20%", // initial height
          }}
        />
      ))}
    </div>
  );
}
