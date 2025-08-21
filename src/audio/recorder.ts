import workletUrl from './AudioWorkletProcessor.ts?url';

export type AudioSource = 'mic' | 'system';

export interface RecorderData {
  blob: Blob;
  encoding: 'LINEAR16' | 'OGG_OPUS';
}

export interface RecorderOptions {
  onData: (data: RecorderData) => void;
  onStop: () => void;
  getSampleRate?: (rate: number) => void;
}

export class Recorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private options: RecorderOptions;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(options: RecorderOptions) {
    this.options = options;
  }

  private async initWorklet() {
    if (!this.stream) throw new Error('Stream not available');

    this.audioContext = new AudioContext();
    if (this.options.getSampleRate) {
      this.options.getSampleRate(this.audioContext.sampleRate);
    }

    try {
      await this.audioContext.audioWorklet.addModule(workletUrl);
    } catch (e) {
      console.error('Error adding audio worklet module', e);
      throw e;
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'resampler-processor');

    this.workletNode.port.onmessage = (event: MessageEvent<Int16Array>) => {
      const blob = new Blob([event.data], { type: 'application/octet-stream' });
      this.options.onData({ blob, encoding: 'LINEAR16' });
    };

    this.source.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);
  }

  private initMediaRecorder() {
    if (!this.stream) throw new Error('Stream not available');

    const options = { mimeType: 'audio/ogg;codecs=opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.warn(`${options.mimeType} is not supported. Falling back to default.`);
        this.mediaRecorder = new MediaRecorder(this.stream);
    } else {
        this.mediaRecorder = new MediaRecorder(this.stream, options);
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.options.onData({ blob: event.data, encoding: 'OGG_OPUS' });
      }
    };

    this.mediaRecorder.onstop = () => {
      this.options.onStop();
    };

    this.mediaRecorder.start(1000); // 1-second chunks
  }

  async start(stream: MediaStream) {
    this.stream = stream;
    const useWorklet = typeof AudioWorkletNode !== 'undefined';

    if (useWorklet) {
      try {
        await this.initWorklet();
      } catch (e) {
        console.warn('AudioWorklet failed, falling back to MediaRecorder', e);
        this.initMediaRecorder();
      }
    } else {
      console.warn('AudioWorklet not supported, falling back to MediaRecorder');
      this.initMediaRecorder();
    }
  }

  stop() {
    if (this.workletNode) {
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.source) {
        this.source.disconnect();
        this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.options.onStop();
  }
}

export async function getMicrophoneStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  }

  export async function getSystemAudioStream(): Promise<MediaStream> {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    displayStream.getVideoTracks().forEach((track) => track.stop());

    return displayStream;
  }
