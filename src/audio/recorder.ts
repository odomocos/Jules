import workletUrl from './AudioWorkletProcessor.ts?url';
import { encodeWAV } from './wav-encoder';

export type AudioEncoding = 'WAV' | 'OGG_OPUS';

export interface RecorderData {
  blob: Blob;
  encoding: AudioEncoding;
}

export interface RecorderOptions {
  onData: (data: RecorderData) => void;
  onStop: () => void;
  getSampleRate: (rate: number) => void;
}

export class Recorder {
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private options: RecorderOptions;

  // Buffering properties for the AudioWorklet path
  private pcmBuffer: Int16Array[] = [];
  private bufferFlushTimer: number | null = null;
  private readonly bufferFlushInterval = 1500; // ms

  constructor(options: RecorderOptions) {
    this.options = options;
  }

  private flushBuffer = () => {
    if (this.pcmBuffer.length === 0 || !this.audioContext) {
      return;
    }

    // Concatenate all buffered chunks into one large PCM array
    const totalLength = this.pcmBuffer.reduce((acc, val) => acc + val.length, 0);
    const concatenatedPCM = new Int16Array(totalLength);
    let offset = 0;
    for (const buffer of this.pcmBuffer) {
      concatenatedPCM.set(buffer, offset);
      offset += buffer.length;
    }
    this.pcmBuffer = []; // Clear the buffer

    // Encode the large chunk as a single WAV file
    const wavBlob = encodeWAV(concatenatedPCM, this.audioContext.sampleRate);
    this.options.onData({ blob: wavBlob, encoding: 'WAV' });
  }

  private async initWorklet(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.options.getSampleRate(this.audioContext.sampleRate);

    try {
      await this.audioContext.audioWorklet.addModule(workletUrl);
    } catch (e) {
      console.error('Error adding AudioWorklet module. Falling back to MediaRecorder.', e);
      this.initMediaRecorder(stream);
      return;
    }

    this.source = this.audioContext.createMediaStreamSource(stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'resampler-processor');

    // Instead of sending data immediately, push it to our buffer.
    this.workletNode.port.onmessage = (event: MessageEvent<Int16Array>) => {
      this.pcmBuffer.push(event.data);
    };

    this.source.connect(this.workletNode);

    // Start a timer to flush the buffer periodically
    this.bufferFlushTimer = window.setInterval(this.flushBuffer, this.bufferFlushInterval);
  }

  private initMediaRecorder(stream: MediaStream) {
    if (!MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser.');
    }
    const options = { mimeType: 'audio/ogg;codecs=opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported. Using default.`);
        this.mediaRecorder = new MediaRecorder(stream);
    } else {
        this.mediaRecorder = new MediaRecorder(stream, options);
    }
    this.options.getSampleRate(this.mediaRecorder.stream.getAudioTracks()[0].getSettings().sampleRate || 0);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.options.onData({ blob: event.data, encoding: 'OGG_OPUS' });
      }
    };

    this.mediaRecorder.onstop = this.options.onStop;
    this.mediaRecorder.start(this.bufferFlushInterval); // Use same interval for consistency
  }

  async start(stream: MediaStream) {
    const useWorklet = typeof AudioWorkletNode !== 'undefined';

    if (useWorklet) {
      await this.initWorklet(stream);
    } else {
      console.warn('AudioWorklet not supported, falling back to MediaRecorder.');
      this.initMediaRecorder(stream);
    }
  }

  stop() {
    if (this.workletNode && this.source && this.audioContext) {
      // Worklet path cleanup
      if (this.bufferFlushTimer) {
        clearInterval(this.bufferFlushTimer);
        this.bufferFlushTimer = null;
      }
      this.flushBuffer(); // Send any remaining data
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.source.disconnect();
      this.audioContext.close();
      this.options.onStop();
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop(); // onstop callback will trigger options.onStop
    }
  }
}

/**
 * Requests a media stream from the user's microphone.
 */
export async function getMicrophoneStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
}

/**
 * Requests a media stream from the user's system or a specific tab by prompting for screen sharing.
 */
export async function getSystemAudioStream(): Promise<MediaStream> {
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  displayStream.getVideoTracks().forEach((track) => track.stop());

  const audioTracks = displayStream.getAudioTracks();
  if (audioTracks.length === 0) {
    displayStream.getTracks().forEach((track) => track.stop());
    throw new Error("No audio track was shared. Please ensure you check 'Share tab audio' or 'Share system audio'.");
  }

  return displayStream;
}
