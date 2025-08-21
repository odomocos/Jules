import { RecorderData } from '../audio/recorder';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface UploadMetadata {
  sessionId: string;
  source: 'mic' | 'system';
  sourceLang: string;
  targetLang: string;
  sampleRateHz: number | null;
}

export class Uploader {
  private seq = 0;
  private metadata: UploadMetadata;

  constructor(metadata: UploadMetadata) {
    this.metadata = metadata;
  }

  setSampleRate(sampleRateHz: number) {
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
    formData.append('audio', data.blob, 'audio.chunk');

    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/audio-chunk`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      console.log('Chunk uploaded successfully');
    } catch (error) {
      console.error('Error uploading chunk:', error);
      throw error;
    }
  }

  async finalize() {
    // Send a final message with no audio data
    const emptyBlob = new Blob([], { type: 'application/octet-stream' });
    const data: RecorderData = { blob: emptyBlob, encoding: 'LINEAR16' }; // Encoding doesn't matter much here
    await this.uploadChunk(data, true);
  }
}
