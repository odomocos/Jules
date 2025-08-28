# Live Audio Translation App (React + Vite)

This is a browser-based application that captures audio from a microphone or the system/tab, streams it to an n8n webhook for processing, and presents a live translation in both text and audio format.

## Features

-   **Dual Audio Source**: Capture audio from either the user's microphone or the system/tab audio (on supported browsers).
-   **High-Quality Audio Processing**: Audio is resampled to **16 kHz mono LINEAR16 PCM** using a real-time `AudioWorklet`, making it ideal for speech-to-text services.
-   **Graceful Fallback**: Automatically uses `MediaRecorder` (OGG/Opus format) if `AudioWorklet` is not supported.
-   **Live Text Translation**: Displays "interim" and "final" translated text segments as they are received from the backend.
-   **Audio Playback**: Automatically plays the translated audio corresponding to each final text segment.
-   **Specific Language Pair**: Designed for seamless translation between **English** and **Romanian**.
-   **Configurable Backend**: The n8n webhook URL and other settings are configurable via a `.env` file.

## Browser Support

-   **Microphone Capture**: Works on all modern browsers (Chrome, Edge, Firefox, Safari).
-   **System/Tab Audio Capture**: This feature relies on the `getDisplayMedia` API and is best supported on **Chromium-based browsers (Google Chrome, Microsoft Edge)**. The user must explicitly grant permission and enable audio sharing when prompted.

## Project Setup

### 1. Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root. You can do this by copying the `.env.example` file if one exists, or by creating it manually. Add the following variables:

```
# The base URL for your n8n webhook workflow
VITE_N8N_WEBHOOK_URL="https://your-n8n.example.com/webhook/voice"

# The default target language. The UI will automatically switch to the other language.
VITE_DEFAULT_TARGET_LANG="ro-RO"

# Use Server-Sent Events (SSE) for real-time updates. Set to "false" to use polling.
VITE_USE_SSE="true"
```

## Running the Application

To start the development server, run:
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173`.

Other available scripts:
-   `npm run build`: To build the application for production.
-   `npm run preview`: To preview the production build locally.

## N8N Webhook Contract

The application expects the n8n backend to expose the following endpoints at the `VITE_N8N_WEBHOOK_URL` base path.

### 1. Audio Upload Endpoint

-   **Path**: `/audio-chunk`
-   **Method**: `POST`
-   **Body**: `multipart/form-data` with two fields:
    -   `meta`: A JSON string containing metadata like `sessionId`, `seq` (sequence number), `encoding`, `sampleRateHz`, languages, and an `isFinal` flag.
    -   `audio`: The binary audio data chunk.

### 2. Translation Streaming Endpoint

The application connects to this endpoint to receive live results.

#### Recommended: Server-Sent Events (SSE)
-   **Path**: `/translation/stream?sessionId=<sessionId>`
-   **Protocol**: `EventSource` (SSE)
-   **Events**: The server should send `message` events with a JSON payload. The payload can contain `interim` text, `final` text, and an `audioUrl`.
    ```json
    // Example for an interim result
    { "interim": "this is a partial" }

    // Example for a final result with audio
    { "final": "This is a final translation.", "audioUrl": "https://your-storage/audio/123.mp3" }
    ```

#### Fallback: Polling
-   **Path**: `/translation?sessionId=<sessionId>`
-   **Method**: `GET`
-   **Response**: A JSON object with an array of new items since the last poll.
    ```json
    {
      "items": [
        { "interim": "another partial result" },
        { "final": "Another final result.", "audioUrl": "https://your-storage/audio/456.mp3" }
      ]
    }
    ```
