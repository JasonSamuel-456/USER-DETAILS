import React from 'react';
import { AlertCircle, Terminal, CheckCircle2 } from 'lucide-react';

export default function ConnectionBanner({ healthStatus, onRetry }) {
  if (!healthStatus || healthStatus.database === 'connected') return null;

  return (
    <div className="alert-banner">
      <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div className="alert-title">MySQL Database Connection Notice</div>
        <div className="alert-desc">
          The FastAPI backend is running, but MySQL returned an authentication or connection notice:
          <br />
          <span className="alert-code" style={{ display: 'inline-block', margin: '4px 0' }}>
            {healthStatus.error || 'Access denied or MySQL server not reached on localhost:3306'}
          </span>
          <br />
          <strong>Quick Fix:</strong> Open <span className="alert-code">backend/.env</span> and update{' '}
          <span className="alert-code">DB_PASSWORD</span> with your local MySQL root password, then click{' '}
          <button
            onClick={onRetry}
            style={{
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Retry Connection
          </button>
          .
        </div>
      </div>
    </div>
  );
}
