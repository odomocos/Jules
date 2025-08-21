import React from 'react';

interface ControlsProps {
  isRecording: boolean;
  isSystemAudioSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  onSourceChange: (source: 'mic' | 'system') => void;
  onSourceLangChange: (lang: string) => void;
  onTargetLangChange: (lang: string) => void;
  source: 'mic' | 'system';
  sourceLang: string;
  targetLang: string;
}

const Controls: React.FC<ControlsProps> = ({
  isRecording,
  isSystemAudioSupported,
  onStart,
  onStop,
  onSourceChange,
  onSourceLangChange,
  onTargetLangChange,
  source,
  sourceLang,
  targetLang,
}) => {
  return (
    <div>
      <h2>Controls</h2>
      <div>
        <label>
          <input
            type="radio"
            name="source"
            value="mic"
            checked={source === 'mic'}
            onChange={() => onSourceChange('mic')}
            disabled={isRecording}
          />
          Microphone
        </label>
        <label title={!isSystemAudioSupported ? 'System audio capture is not supported in this browser.' : ''}>
          <input
            type="radio"
            name="source"
            value="system"
            checked={source === 'system'}
            onChange={() => onSourceChange('system')}
            disabled={isRecording || !isSystemAudioSupported}
          />
          System/Tab Audio
        </label>
      </div>
      <div>
        <label>
          Source Language:
          <input
            type="text"
            value={sourceLang}
            onChange={(e) => onSourceLangChange(e.target.value)}
            disabled={isRecording}
          />
        </label>
      </div>
      <div>
        <label>
          Target Language:
          <input
            type="text"
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value)}
            disabled={isRecording}
          />
        </label>
      </div>
      <div>
        <button onClick={onStart} disabled={isRecording}>
          Start
        </button>
        <button onClick={onStop} disabled={!isRecording}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default Controls;
