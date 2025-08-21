import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import Status from './components/Status';
import { Recorder, getMicrophoneStream, getSystemAudioStream, RecorderData } from './audio/recorder';
import { Uploader } from './api/uploader';
import { TranslationClient, TranslationResult } from './api/translationClient';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [source, setSource] = useState<'mic' | 'system'>('mic');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(import.meta.env.VITE_DEFAULT_TARGET_LANG || 'en');
  const [interim, setInterim] = useState('');
  const [final, setFinal] = useState<string[]>([]);
  const [permissionState, setPermissionState] = useState('prompt');
  const [deviceName, setDeviceName] = useState('');
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [chunkSize, setChunkSize] = useState<number | null>(null);
  const [bytesSent, setBytesSent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSystemAudioSupported, setIsSystemAudioSupported] = useState(false);

  const recorderRef = useRef<Recorder | null>(null);
  const uploaderRef = useRef<Uploader | null>(null);
  const translationClientRef = useRef<TranslationClient | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const handleData = (data: RecorderData) => {
    uploaderRef.current?.uploadChunk(data).catch((err) => {
      setError(`Upload failed: ${err.message}`);
      stopRecording();
    });
    setBytesSent((prev) => prev + data.blob.size);
    setChunkSize(data.blob.size);
  };

  const handleStop = () => {
    setIsRecording(false);
    setDeviceName('');
  };

  const onTranslation = (result: TranslationResult) => {
    if (result.interim) {
      setInterim(result.interim);
    }
    if (result.final) {
      setInterim('');
      setFinal((prev) => [...prev, result.final as string]);
    }
  };

  const handleStart = async () => {
    setError(null);
    setBytesSent(0);
    setChunkSize(null);
    setSampleRate(null);
    setInterim('');
    setFinal([]);

    try {
      const stream =
        source === 'mic'
          ? await getMicrophoneStream()
          : await getSystemAudioStream();

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setDeviceName(audioTrack.label);
      }

      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      if (translationClientRef.current) {
        translationClientRef.current.stop();
      }

      sessionIdRef.current = uuidv4();
      uploaderRef.current = new Uploader({
        sessionId: sessionIdRef.current,
        source,
        sourceLang,
        targetLang,
        sampleRateHz: null,
      });

      translationClientRef.current = new TranslationClient({
        sessionId: sessionIdRef.current,
        onTranslation,
        onError: (err) => setError(`Translation error: ${err.message}`),
      });

      const recorder = new Recorder({
        onData: handleData,
        onStop: handleStop,
        getSampleRate: (rate) => {
          setSampleRate(rate);
          uploaderRef.current?.setSampleRate(rate);
        },
      });

      await recorder.start(stream);
      recorderRef.current = recorder;
      setPermissionState('granted');
      setIsRecording(true);
      translationClientRef.current.start();

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Could not get audio stream: ${errorMessage}. Please check permissions.`);
      setPermissionState('denied');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    uploaderRef.current?.finalize().catch((err) => {
        setError(`Finalization failed: ${err.message}`);
    });
    translationClientRef.current?.stop();
  };

  useEffect(() => {
    if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
      setIsSystemAudioSupported(true);
    }

    return () => {
      recorderRef.current?.stop();
      translationClientRef.current?.stop();
    };
  }, []);

  return (
    <div className="App">
      <h1>Live Translation</h1>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Status
        permissionState={permissionState}
        deviceName={deviceName}
        sampleRate={sampleRate}
        chunkSize={chunkSize}
        bytesSent={bytesSent}
      />
      <Transcript interim={interim} final={final} />
    </div>
  );
}

export default App;
