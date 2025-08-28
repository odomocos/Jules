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

  constructor(options: RecorderOptions) {
    this.options = options;
  }

  private async initWorklet(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.options.getSampleRate(this.audioContext.sampleRate);

    try {
      await this.audioContext.audioWorklet.addModule(workletUrl);
    } catch (e) {
      console.error('Error adding AudioWorklet module. Falling back to MediaRecorder.', e);
      this.initMediaRecorder(stream); // Fallback on error
      return;
    }

    this.source = this.audioContext.createMediaStreamSource(stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'resampler-processor');

    this.workletNode.port.onmessage = (event: MessageEvent<Int16Array>) => {
      const pcmData = event.data;
      const wavBlob = encodeWAV(pcmData, this.audioContext!.sampleRate);
      this.options.onData({ blob: wavBlob, encoding: 'WAV' });
    };

    this.source.connect(this.workletNode);
    // We don't need to connect to the destination, as we're not playing the audio back here.
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
    this.mediaRecorder.start(1000); // 1-second chunks
  }

  async start(stream: MediaStream) {
    this.stream = stream;
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
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.source.disconnect();
      this.audioContext.close();
      this.options.onStop();
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop(); // onstop callback will trigger options.onStop
    }

    // The stream tracks are stopped in App.tsx to ensure the ref is cleaned up.
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
 * The user must explicitly choose to share their audio.
 */
export async function getSystemAudioStream(): Promise<MediaStream> {
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true, // Video is required to prompt for audio sharing in most browsers.
    audio: true,
  });

  // We only want the audio. Stop the video track to save resources and prevent a video feed from showing.
  displayStream.getVideoTracks().forEach((track) => track.stop());

  const audioTracks = displayStream.getAudioTracks();
  if (audioTracks.length === 0) {
    // Stop all tracks and throw an error if the user didn't share audio.
    displayStream.getTracks().forEach((track) => track.stop());
    throw new Error("No audio track was shared. Please ensure you check 'Share tab audio' or 'Share system audio'.");
  }

  return displayStream;
}
