const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const USE_SSE = import.meta.env.VITE_USE_SSE === 'true';

export interface TranslationResult {
  interim?: string;
  final?: string;
}

export interface PollingResponse {
  items: { type: 'interim' | 'final'; text: string }[];
}

interface TranslationClientOptions {
  sessionId: string;
  onTranslation: (result: TranslationResult) => void;
  onError: (error: Error) => void;
}

export class TranslationClient {
  private options: TranslationClientOptions;
  private eventSource: EventSource | null = null;
  private pollingInterval: number | null = null;

  constructor(options: TranslationClientOptions) {
    this.options = options;
  }

  start() {
    if (USE_SSE) {
      this.connectSSE();
    } else {
      this.startPolling();
    }
  }

  stop() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private connectSSE() {
    const url = `${N8N_WEBHOOK_URL}/translation/stream?sessionId=${this.options.sessionId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TranslationResult;
        this.options.onTranslation(data);
      } catch (e) {
        this.options.onError(new Error('Failed to parse translation event'));
      }
    };

    this.eventSource.onerror = () => {
      this.options.onError(new Error('Translation stream connection error'));
      this.stop();
    };
  }

  private startPolling() {
    const url = `${N8N_WEBHOOK_URL}/translation?sessionId=${this.options.sessionId}`;

    const poll = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Polling failed with status ${response.status}`);
        }
        const data = (await response.json()) as PollingResponse;
        // This needs to be smarter to avoid sending the whole history every time.
        // Assuming the server sends only new items since the last poll would be better.
        // For now, we process all items. A more robust client would track received items.
        data.items.forEach(item => {
            if (item.type === 'interim') {
                this.options.onTranslation({ interim: item.text });
            } else {
                this.options.onTranslation({ final: item.text });
            }
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Polling failed');
        this.options.onError(error);
        this.stop();
      }
    };

    // Poll immediately and then set interval
    poll();
    this.pollingInterval = window.setInterval(poll, 1000);
  }
}
