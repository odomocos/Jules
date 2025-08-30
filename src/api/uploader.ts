import type { RecorderData } from '../audio/recorder';
import { encodeWAV } from '../audio/wav-encoder';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

if (!N8N_WEBHOOK_URL) {
  throw new Error("VITE_N8N_WEBHOOK_URL is not defined. Please check your .env file.");
}

export interface UploadMetadata {
  sessionId: string;
  source: 'mic' | 'system';
  sourceLang: 'en-US' | 'ro-RO';
  targetLang: 'en-US' | 'ro-RO';
  sampleRateHz: number | null;
}

export class Uploader {
  private seq = 0;
  private metadata: UploadMetadata;

  constructor(metadata: UploadMetadata) {
    this.metadata = metadata;
  }

  public setSampleRate(sampleRateHz: number) {
    this.metadata.sampleRateHz = sampleRateHz;
  }

  async uploadChunk(data: RecorderData, isFinal = false) {
    const formData = new FormData();
    const meta = {
      ...this.metadata,
      seq: this.seq++,
      encoding: data.encoding,
      isFinal,
    };
    formData.append('meta', JSON.stringify(meta));
    // Use a filename with a .wav extension
    const filename = meta.encoding === 'WAV' ? `chunk-${meta.seq}.wav` : `chunk-${meta.seq}.ogg`;
    formData.append('audio', data.blob, filename);

    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/audio-chunk`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Upload failed with status ${response.status}: ${errorBody}`);
      }
      console.log(`Chunk ${meta.seq} uploaded successfully.`);
    } catch (error) {
      console.error('Error uploading chunk:', error);
      // Re-throw to be caught by the calling function in App.tsx
      throw error;
    }
  }

  async finalize() {
    // Send a final WAV file containing 0.1s of silence to signal the end of the stream.
    // This is required to satisfy the minimum audio length for some transcription APIs.
    console.log('Sending finalization signal...');
    const sampleRate = this.metadata.sampleRateHz || 16000;
    const silentSamples = new Int16Array(sampleRate * 0.1); // 0.1 seconds of silence
    const silentWavBlob = encodeWAV(silentSamples, sampleRate);
    const data: RecorderData = { blob: silentWavBlob, encoding: 'WAV' };
    await this.uploadChunk(data, true);
  }
}
