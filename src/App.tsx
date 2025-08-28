import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import Status from './components/Status';
import { Recorder, getMicrophoneStream, getSystemAudioStream } from './audio/recorder';
import type { RecorderData } from './audio/recorder';
import { Uploader } from './api/uploader';
import { TranslationClient } from './api/translationClient';
import type { TranslationResult } from './api/translationClient';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [source, setSource] = useState<'mic' | 'system'>('mic');
  const [sourceLang, setSourceLang] = useState<'en-US' | 'ro-RO'>('en-US');
  const [targetLang, setTargetLang] = useState<'en-US' | 'ro-RO'>('ro-RO');
  const [interim, setInterim] = useState('');
  const [final, setFinal] = useState<string[]>([]);
  const [permissionState, setPermissionState] = useState('prompt');
  const [deviceName, setDeviceName] = useState('');
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [chunkSize, setChunkSize] = useState<number | null>(null);
  const [bytesSent, setBytesSent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSystemAudioSupported, setIsSystemAudioSupported] = useState(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const uploaderRef = useRef<Uploader | null>(null);
  const translationClientRef = useRef<TranslationClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onTranslation = (result: TranslationResult) => {
    if (result.interim) {
      setInterim(result.interim);
    }
    if (result.final) {
      setFinal((prev) => [...prev, result.final as string]);
      setInterim('');
    }
    if (result.audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = result.audioUrl;
      audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  const handleData = (data: RecorderData) => {
    uploaderRef.current?.uploadChunk(data).catch((err) => {
      setError(`Upload failed: ${err.message}`);
      stopRecording();
    });
    setBytesSent((prev) => prev + data.blob.size);
    setChunkSize(data.blob.size);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    translationClientRef.current?.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    uploaderRef.current?.finalize().catch((err) => {
      setError(`Finalization failed: ${err.message}`);
    });
    setIsRecording(false);
    setDeviceName('');
  };

  const handleStart = async () => {
    setError(null);
    setPermissionState('prompt');
    setBytesSent(0);
    setChunkSize(null);
    setSampleRate(null);
    setFinal([]);
    setInterim('');

    try {
      const stream =
        source === 'mic'
          ? await getMicrophoneStream()
          : await getSystemAudioStream();

      streamRef.current = stream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setDeviceName(audioTrack.label || 'Unknown Device');
        audioTrack.onended = () => stopRecording();
      }

      const sessionId = uuidv4();
      uploaderRef.current = new Uploader({
        sessionId,
        source,
        sourceLang,
        targetLang,
        sampleRateHz: null,
      });

      translationClientRef.current = new TranslationClient({
        sessionId,
        onTranslation,
        onError: (err) => setError(`Translation error: ${err.message}`),
      });

      recorderRef.current = new Recorder({
        onData: handleData,
        onStop: stopRecording,
        getSampleRate: (rate) => {
          setSampleRate(rate);
          uploaderRef.current?.setSampleRate(rate);
        },
      });

      await recorderRef.current.start(stream);
      setPermissionState('granted');
      setIsRecording(true);
      translationClientRef.current.start();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Could not start recording: ${errorMessage}`);
      setPermissionState('denied');
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
      setIsSystemAudioSupported(true);
    }
    return () => {
      // Ensure everything is stopped on unmount
      recorderRef.current?.stop();
      translationClientRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Live Audio Translation</h1>
        <p>English &harr; Romanian</p>
      </header>
      <main>
        <div className="main-controls">
          <Controls
            isRecording={isRecording}
            isSystemAudioSupported={isSystemAudioSupported}
            onStart={handleStart}
            onStop={stopRecording}
            onSourceChange={setSource}
            onSourceLangChange={setSourceLang}
            onTargetLangChange={setTargetLang}
            source={source}
            sourceLang={sourceLang}
            targetLang={targetLang}
          />
          <Status
            permissionState={permissionState}
            deviceName={deviceName}
            sampleRate={sampleRate}
            chunkSize={chunkSize}
            bytesSent={bytesSent}
          />
        </div>
        <Transcript interim={interim} final={final} />
      </main>
      {error && <div className="error-banner">{error}</div>}
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
