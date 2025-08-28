import React from 'react';

interface StatusProps {
  permissionState: string;
  deviceName: string;
  sampleRate: number | null;
  chunkSize: number | null;
  bytesSent: number;
}

const Status: React.FC<StatusProps> = ({
  permissionState,
  deviceName,
  sampleRate,
  chunkSize,
  bytesSent,
}) => {
  return (
    <div className="status-container">
      <h2>Status</h2>
      <p><strong>Permission:</strong> {permissionState}</p>
      <p><strong>Device:</strong> {deviceName || 'N/A'}</p>
      <p><strong>Sample Rate:</strong> {sampleRate ? `${sampleRate} Hz` : 'N/A'}</p>
      <p><strong>Chunk Size:</strong> {chunkSize ? `${chunkSize} bytes` : 'N/A'}</p>
      <p><strong>Total Sent:</strong> {`${(bytesSent / 1024).toFixed(2)} KB`}</p>
    </div>
  );
};

export default Status;
