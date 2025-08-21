import React from 'react';

interface TranscriptProps {
  interim: string;
  final: string[];
}

const Transcript: React.FC<TranscriptProps> = ({ interim, final }) => {
  return (
    <div>
      <h2>Transcript</h2>
      <div id="final-transcript">
        {final.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
      <div id="interim-transcript" style={{ color: 'gray' }}>
        <p>{interim}</p>
      </div>
    </div>
  );
};

export default Transcript;
