import type { AudioFrequencyData } from '../../../../shared/types';

export default class AudioAnalyser {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  private isActive = true;

  constructor(audioContext: AudioContext, stream: MediaStream) {
    this.audioContext = audioContext;
    this.analyser = this.createAnalyser();
    this.source = audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
  }

  private createAnalyser(): AnalyserNode {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256; // gives us 128 frequency bins
    analyser.smoothingTimeConstant = 0.8; // smooth out rapid changes
    return analyser;
  }

  getFrequencyData(): AudioFrequencyData {
    if (!this.isActive) {
      return { bands: [0, 0, 0, 0, 0], overallLevel: 0 };
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const sampleRate = this.audioContext.sampleRate;
    const binSize = sampleRate / (this.analyser.fftSize * 2);

    // human voice frequency ranges
    const frequencyRanges = [
      { min: 80, max: 250 },    // low fundamentals
      { min: 250, max: 500 },   // vocal fry, low voice  
      { min: 500, max: 1000 },  // main vocal range
      { min: 1000, max: 2000 }, // clarity, consonants
      { min: 2000, max: 4000 }  // presence, sibilance
    ];

    const bands: number[] = [];
    let totalEnergy = 0;
    let totalSamples = 0;
    const noiseThreshold = 25;

    for (const range of frequencyRanges) {
      const startBin = Math.floor(range.min / binSize);
      const endBin = Math.floor(range.max / binSize);

      let sum = 0;
      let count = 0;

      for (let i = startBin; i < Math.min(endBin, dataArray.length); i++) {
        if (dataArray[i] > noiseThreshold) {
          // non-linear scaling to emphasize mid-level sounds
          const adjustedValue = Math.pow(dataArray[i] - noiseThreshold, 1.5);
          sum += adjustedValue;
          count++;
          totalEnergy += adjustedValue;
          totalSamples++;
        }
      }

      const bandLevel = count > 0 ? Math.min(100, Math.sqrt(sum / count) * 3) : 0;
      bands.push(bandLevel);
    }

    const overallLevel = totalSamples > 0 ?
      Math.min(100, Math.sqrt(totalEnergy / totalSamples) * 3) : 0;

    return { bands, overallLevel };
  }

  getOverallLevel(): number {
    return this.getFrequencyData().overallLevel;
  }


  setActive(active: boolean) {
    this.isActive = active;
  }

  cleanup() {
    if (this.source) {
      this.source.disconnect();
    }
    this.isActive = false;
  }
}
