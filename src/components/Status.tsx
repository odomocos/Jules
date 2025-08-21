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
    <div>
      <h2>Status</h2>
      <p>Permission: {permissionState}</p>
      <p>Device: {deviceName || 'N/A'}</p>
      <p>Sample Rate: {sampleRate || 'N/A'}</p>
      <p>Chunk Size: {chunkSize || 'N/A'}</p>
      <p>Bytes Sent: {bytesSent}</p>
    </div>
  );
};

export default Status;
