# Live Translation Browser App

This is a browser-based application that captures audio from either the system/tab or a microphone, streams it to an n8n webhook for translation, and displays the live translated text.

## Features

-   **Audio Source Selection**: Toggle between "System/Tab Audio" and "Microphone".
-   **Live Streaming**: Streams audio in small chunks to a backend service.
-   **High-Quality Audio**: Captures and processes audio to **LINEAR16 PCM at 16 kHz, mono**, which is ideal for Google Speech-to-Text.
-   **Fallback Support**: Includes a fallback to **OGG/Opus** streaming using `MediaRecorder` if `AudioWorklet` is not supported.
-   **Live Translation Display**: Receives translations from the backend and displays them in real-time, showing both interim and final results.
-   **Configurable**: Key settings can be configured via environment variables.

## Browser Support

-   **Microphone Capture**: Works on all modern browsers, including Chrome, Edge, Firefox, and Safari.
-   **System/Tab Audio Capture**: This feature relies on the `getDisplayMedia` API with the `audio` constraint, which is currently supported in **Chromium-based browsers (Chrome, Edge)**. Users will be prompted to share a tab or screen and must check the "Share audio" option. The option will be disabled in unsupported browsers.

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the root of the project. You can copy the existing `.env.example` if one exists, or create the file manually and add the following variables:

    ```
    # The full URL to your n8n webhook for handling audio chunks
    VITE_N8N_WEBHOOK_URL="https://your-n8n.example.com/webhook/voice"

    # The default target language for translation (BCP-47 code)
    VITE_DEFAULT_TARGET_LANG="en"

    # Set to "true" to use Server-Sent Events (SSE) for receiving translations.
    # Set to "false" to use polling.
    VITE_USE_SSE="true"
    ```

## Running the Application

-   **Development mode:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically at `http://localhost:5173`.

-   **Build for production:**
    ```bash
    npm run build
    ```

-   **Preview the production build:**
    ```bash
    npm run preview
    ```

## n8n Webhook Contract

This application assumes your n8n workflow exposes the following endpoints:

### 1. `/audio-chunk` (POST)

-   **Endpoint**: `VITE_N8N_WEBHOOK_URL + /audio-chunk`
-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`
-   **Body**:
    -   `meta` (field): A JSON string with the following structure:
        ```json
        {
          "sessionId": "string",
          "seq": "number",
          "encoding": "'LINEAR16' | 'OGG_OPUS'",
          "sampleRateHz": "number | null",
          "source": "'mic' | 'system'",
          "sourceLang": "string",
          "targetLang": "string",
          "isFinal": "boolean"
        }
        ```
    -   `audio` (field): The binary audio data chunk (`Blob`).

-   **n8n Action**: The webhook should receive the chunk, and if `isFinal: true`, it should trigger the full Speech-to-Text and Translation pipeline.

### 2. `/translation` Endpoints

The application will connect to one of two endpoints based on the `VITE_USE_SSE` flag.

#### SSE Mode (`VITE_USE_SSE="true"`)

-   **Endpoint**: `VITE_N8N_WEBHOOK_URL + /translation/stream?sessionId=<sessionId>`
-   **Protocol**: Server-Sent Events (`EventSource`)
-   **Events**: The server should send `message` events with a JSON payload:
    ```json
    {
      "interim": "string", // Optional: partial, non-final transcript
      "final": "string"    // Optional: confirmed, final transcript segment
    }
    ```

#### Polling Mode (`VITE_USE_SSE="false"`)

-   **Endpoint**: `VITE_N8N_WEBHOOK_URL + /translation?sessionId=<sessionId>`
-   **Method**: `GET`
-   **Response**: A JSON object with an array of translation items:
    ```json
    {
      "items": [
        { "type": "interim", "text": "string" },
        { "type": "final", "text": "string" }
      ]
    }
    ```
    **Note**: To avoid reprocessing old data, the n8n workflow should ideally send only new items since the last poll.
