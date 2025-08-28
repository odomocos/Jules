import React from 'react';

interface ControlsProps {
  isRecording: boolean;
  isSystemAudioSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  onSourceChange: (source: 'mic' | 'system') => void;
  onSourceLangChange: (lang: 'en-US' | 'ro-RO') => void;
  onTargetLangChange: (lang: 'en-US' | 'ro-RO') => void;
  source: 'mic' | 'system';
  sourceLang: 'en-US' | 'ro-RO';
  targetLang: 'en-US' | 'ro-RO';
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
  const handleSourceLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceLang = e.target.value as 'en-US' | 'ro-RO';
    onSourceLangChange(newSourceLang);
    // Automatically set target language to the other option
    onTargetLangChange(newSourceLang === 'en-US' ? 'ro-RO' : 'en-US');
  };

  return (
    <div className="controls-container">
      <h2>Controls</h2>
      <div className="control-group">
        <strong>Audio Source:</strong>
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
      <div className="control-group">
        <label>
          <strong>Translate from:</strong>
          <select value={sourceLang} onChange={handleSourceLangChange} disabled={isRecording}>
            <option value="en-US">English</option>
            <option value="ro-RO">Romanian</option>
          </select>
        </label>
        <label>
          <strong>To:</strong>
          <input type="text" value={targetLang === 'en-US' ? 'English' : 'Romanian'} readOnly disabled />
        </label>
      </div>
      <div className="control-group">
        <button onClick={onStart} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={onStop} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
    </div>
  );
};

export default Controls;
