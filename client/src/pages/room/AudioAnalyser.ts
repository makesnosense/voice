import type { AudioFrequencyData } from '../../../../shared/types/core';

// | stage                    | name                                             | what                              |
// | ------------------------ | ------------------------------------------------ | --------------------------------- |
// | ~48000 samples/s         | stream                                           | live pressure numbers             |
// | tap into the engine      | source (createMediaStreamSource + connect)       | hose stream → analyser            |
// | latest 256 samples       | analyser.fftSize                                 | sliding window                    |
// | 128 pitch-strength bytes | matchStrengths via getByteFrequencyData               | match strength per ~187.5 Hz bin  |
// | 5 bars + overall         | bands, overallLevel (frequencyRanges loop)       | squash those bytes to 0–100       |

export default class AudioAnalyser {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaStreamAudioSourceNode;
  private isActive = true;

  constructor(audioContext: AudioContext, stream: MediaStream) {
    this.audioContext = audioContext;
    this.analyser = this.createAnalyser();
    // adapter: stream is just pressure numbers; this box feeds them into the engine
    this.source = audioContext.createMediaStreamSource(stream);
    // hose: source → analyser. analyser does not play; it only keeps the latest window
    this.source.connect(this.analyser);
  }

  private createAnalyser(): AnalyserNode {
    const analyser = this.audioContext.createAnalyser();
    // each snapshot uses the latest 256 pressure numbers → 128 frequency bins
    analyser.fftSize = 256;
    // mix in the previous snapshot so bars don't jump
    analyser.smoothingTimeConstant = 0.8;
    return analyser;
  }

  getFrequencyData(): AudioFrequencyData {
    if (!this.isActive) {
      return { bands: [0, 0, 0, 0, 0], overallLevel: 0 };
    }

    // for each of the 128 speeds: build a template wave of that speed, same length 256,
    // and ask "does this sample look like this template?" (sine + cosine so a time-shift
    // doesn't matter). each answer is squashed to a byte 0–255 in matchStrengths[i].
    const matchStrengths = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(matchStrengths);

    // sample rate is how many pressure numbers arrive per second
    const sampleRate = this.audioContext.sampleRate;
    // binSize ≈ "how many Hz one step in matchStrengths is" e.g. 48000 / 256 = 187.5
    const binSize = sampleRate / this.analyser.fftSize;

    const frequencyRanges = [
      { min: 80, max: 250 }, // low fundamentals
      { min: 250, max: 500 }, // vocal fry, low voice
      { min: 500, max: 1000 }, // main vocal range
      { min: 1000, max: 2000 }, // clarity, consonants
      { min: 2000, max: 4000 }, // presence, sibilance
    ];

    const bands: number[] = [];
    let totalEnergy = 0;
    let totalSamples = 0;
    const noiseThreshold = 25;

    for (const range of frequencyRanges) {
      // we need to convert 128 matchStrengths into 5 bars. each bar is a Hz range,
      // so divide by binSize to get which indexes that is.
      // 500–1000 Hz → e.g. indexes 2..4. then those matchStrengths slots become one bar.
      const startBin = Math.floor(range.min / binSize);
      const endBin = Math.floor(range.max / binSize);

      let sum = 0;
      let count = 0;

      for (let i = startBin; i < Math.min(endBin, matchStrengths.length); i++) {
        if (matchStrengths[i] > noiseThreshold) {
          // drop the floor, then a curve so mid values show up more on the bars
          const adjustedValue = Math.pow(matchStrengths[i] - noiseThreshold, 1.5);
          sum += adjustedValue;
          count++;
          totalEnergy += adjustedValue;
          totalSamples++;
        }
      }

      const bandLevel = count > 0 ? Math.min(100, Math.sqrt(sum / count) * 3) : 0;
      bands.push(bandLevel);
    }

    const overallLevel =
      totalSamples > 0 ? Math.min(100, Math.sqrt(totalEnergy / totalSamples) * 3) : 0;

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
