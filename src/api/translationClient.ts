const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const USE_SSE = import.meta.env.VITE_USE_SSE !== 'false'; // Default to true

if (!N8N_WEBHOOK_URL) {
  throw new Error("VITE_N8N_WEBHOOK_URL is not defined. Please check your .env file.");
}

export interface TranslationResult {
  interim?: string;
  final?: string;
  audioUrl?: string;
}

// For polling fallback
export interface PollingResponse {
  items: TranslationResult[];
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
  private receivedFinalTexts: Set<string> = new Set(); // For polling, to avoid reprocessing final results

  constructor(options: TranslationClientOptions) {
    this.options = options;
  }

  public start() {
    console.log(`Starting translation client in ${USE_SSE ? 'SSE' : 'Polling'} mode.`);
    if (USE_SSE) {
      this.connectSSE();
    } else {
      this.startPolling();
    }
  }

  public stop() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE client stopped.');
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Polling client stopped.');
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
        this.options.onError(new Error('Failed to parse translation event from server.'));
      }
    };

    this.eventSource.onerror = () => {
      // EventSource automatically tries to reconnect. We'll report the error but let it be.
      // If the connection is truly closed, the server should handle it.
      // We only manually stop on explicit user action.
      this.options.onError(new Error('Connection to translation stream lost. Attempting to reconnect...'));
    };
  }

  private startPolling() {
    const url = `${N8N_WEBHOOK_URL}/translation?sessionId=${this.options.sessionId}`;

    const poll = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Polling request failed with status ${response.status}`);
        }
        const data = (await response.json()) as PollingResponse;

        // Process items, avoiding duplicates for final text
        data.items.forEach(item => {
            if (item.final && !this.receivedFinalTexts.has(item.final)) {
                this.receivedFinalTexts.add(item.final);
                this.options.onTranslation(item);
            } else if (item.interim) {
                this.options.onTranslation(item);
            } else if (item.audioUrl) {
                // Assuming audioUrl comes with a final text, which is already handled.
                // If audioUrl can come alone, we need to handle it separately.
                // For now, we assume it's part of a final message.
                this.options.onTranslation(item);
            }
        });
      } catch (e) {
        const error = e instanceof Error ? e : new Error('An unknown polling error occurred.');
        this.options.onError(error);
        this.stop(); // Stop polling on error
      }
    };

    this.pollingInterval = window.setInterval(poll, 1500); // Poll every 1.5 seconds
  }
}
