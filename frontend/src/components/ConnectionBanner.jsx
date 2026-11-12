import React, { useState } from 'react';
import { AlertCircle, Cloud, X, ExternalLink, Database, CheckCircle2 } from 'lucide-react';

export default function ConnectionBanner({ healthStatus, onRetry }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !healthStatus || healthStatus.database === 'connected') return null;

  const isCloudPreview = healthStatus.database === 'demo' || healthStatus.mode === 'cloud-demo';

  if (isCloudPreview) {
    return (
      <div 
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          color: '#1e40af',
          position: 'relative'
        }}
      >
        <Cloud size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#3b82f6' }} />
        <div style={{ flex: 1, paddingRight: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Vercel Cloud Deployment Mode</span>
            <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '1px 7px', borderRadius: '10px' }}>
              Frontend Online
            </span>
          </div>
          <div style={{ fontSize: '0.825rem', marginTop: '0.35rem', lineHeight: '1.5', color: '#1e3a8a' }}>
            This frontend is deployed live on <strong>Vercel</strong>. All search, filtering, password authentication, and profile editing features are active with interactive browser storage.
            <br />
            <span style={{ color: '#475569', fontSize: '0.785rem' }}>
              💡 <em>Note: Your local MySQL database is located on your laptop (not on the public internet). To link a 24/7 cloud MySQL database, add your cloud backend URL to Vercel environment variable <code style={{ background: '#dbeafe', padding: '1px 5px', borderRadius: '4px' }}>VITE_API_URL</code>.</em>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer'
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // Local connection error
  return (
    <div className="alert-banner">
      <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div className="alert-title">Local MySQL Database Connection Notice</div>
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
