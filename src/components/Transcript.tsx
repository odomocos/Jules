import React from 'react';

interface TranscriptProps {
  interim: string;
  final: string[];
}

const Transcript: React.FC<TranscriptProps> = ({ interim, final }) => {
  return (
    <div className="transcript-container">
      <h2>Transcript</h2>
      <div className="final-transcript">
        {final.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
      <div className="interim-transcript">
        <p>{interim}</p>
      </div>
    </div>
  );
};

export default Transcript;
