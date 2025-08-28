// This file defines the AudioWorkletProcessor for resampling and PCM encoding.
// It runs in a separate thread and communicates with the main thread via messages.

// These are available in the AudioWorkletGlobalScope
declare const sampleRate: number;
declare function registerProcessor(name: string, constructor: any): void;

// We need to declare AudioWorkletProcessor as it's not in the default TS DOM lib.
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: AudioWorkletNodeOptions);
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

/**
 * An AudioWorkletProcessor that resamples and converts audio to 16-bit PCM.
 * It takes multi-channel audio, downmixes it to mono, resamples to a target sample rate,
 * and converts it to 16-bit PCM format.
 */
class ResamplerProcessor extends AudioWorkletProcessor {
  private readonly targetSampleRate = 16000;
  private readonly resampleRatio: number;
  private buffer: Float32Array = new Float32Array(0);

  constructor() {
    super();
    // The 'sampleRate' global variable is provided by the AudioWorkletGlobalScope.
    this.resampleRatio = sampleRate / this.targetSampleRate;
  }

  /**
   * Downmixes multiple channels into a single mono channel by averaging the samples.
   * @param inputChannels - An array of Float32Arrays, where each array represents a channel.
   * @returns A single Float32Array containing the mono audio data.
   */
  private downmix(inputChannels: Float32Array[]): Float32Array {
    if (inputChannels.length === 1) {
      return inputChannels[0];
    }
    const channelCount = inputChannels.length;
    const sampleCount = inputChannels[0].length;
    const mono = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      let sum = 0;
      for (let j = 0; j < channelCount; j++) {
        sum += inputChannels[j][i];
      }
      mono[i] = sum / channelCount;
    }
    return mono;
  }

  /**
   * The main processing function, called by the browser's audio engine.
   */
  process(inputs: Float32Array[][]): boolean {
    const inputChannels = inputs[0];
    // Keep the processor alive, even if there's no input.
    if (!inputChannels || inputChannels.length === 0 || inputChannels[0].length === 0) {
      return true;
    }

    const monoData = this.downmix(inputChannels);

    // Append the new mono data to our internal buffer.
    const newBuffer = new Float32Array(this.buffer.length + monoData.length);
    newBuffer.set(this.buffer);
    newBuffer.set(monoData, this.buffer.length);
    this.buffer = newBuffer;

    // Calculate how many full output samples we can produce from the current buffer.
    const outputLength = Math.floor(this.buffer.length / this.resampleRatio);
    if (outputLength === 0) {
      return true; // Not enough data to produce a sample, wait for more.
    }

    const outputData = new Float32Array(outputLength);
    // Perform linear interpolation for resampling.
    for (let i = 0; i < outputLength; i++) {
      const index = i * this.resampleRatio;
      const indexPrev = Math.floor(index);
      const indexNext = Math.min(indexPrev + 1, this.buffer.length - 1);
      const fraction = index - indexPrev;
      outputData[i] =
        this.buffer[indexPrev] +
        (this.buffer[indexNext] - this.buffer[indexPrev]) * fraction;
    }

    // Remove the processed data from the buffer, keeping the rest for the next call.
    const consumedDataLength = Math.floor(outputLength * this.resampleRatio);
    this.buffer = this.buffer.slice(consumedDataLength);

    // Convert the resampled float32 data to 16-bit PCM.
    const pcmData = new Int16Array(outputData.length);
    for (let i = 0; i < outputData.length; i++) {
      const s = Math.max(-1, Math.min(1, outputData[i]));
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Post the PCM data back to the main thread.
    // The second argument is a list of transferable objects to avoid copying data.
    if (pcmData.length > 0) {
      this.port.postMessage(pcmData, [pcmData.buffer]);
    }

    return true;
  }
}

registerProcessor('resampler-processor', ResamplerProcessor);
