import React from 'react';
import { Users, Plus, RefreshCw, Database, Edit3, UserCheck, LogIn, Moon, Sun } from 'lucide-react';

export default function Navbar({ 
  onAddUser, 
  healthStatus, 
  onRefresh, 
  isRefreshing, 
  onReseed,
  isReseeding,
  currentUser,
  allUsers = [],
  onSelectCurrentUser,
  onEditMyProfile,
  onOpenLogin,
  darkMode,
  onToggleDarkMode
}) {
  const isConnected = healthStatus?.database === 'connected';
  const isCloudDemo = healthStatus?.database === 'demo' || healthStatus?.mode === 'cloud-demo';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-section">
          <div className="brand-icon">
            <Users size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">UserDetails Hub</div>
            <div className="brand-subtitle">React + FastAPI + MySQL</div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Active User Switcher / Sign In */}
          {allUsers.length > 0 && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: darkMode ? '#334155' : '#f1f5f9',
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1'
              }}
            >
              <UserCheck size={16} style={{ color: '#4f46e5' }} />
              <span style={{ fontSize: '0.785rem', fontWeight: 600, color: darkMode ? '#cbd5e1' : '#475569' }}>
                You:
              </span>
              <select
                value={currentUser?.id || ''}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const found = allUsers.find(u => u.id === selectedId);
                  if (found) onSelectCurrentUser(found);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} style={{ color: '#0f172a' }}>
                    {u.full_name || `${u.first_name} ${u.last_name}`}
                  </option>
                ))}
              </select>

              {currentUser && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onEditMyProfile}
                  title="Edit your own user information (Requires password)"
                  style={{ marginLeft: '4px', padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                >
                  <Edit3 size={13} />
                  <span>Edit My Profile</span>
                </button>
              )}
            </div>
          )}

          {/* Secure Sign In Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenLogin}
            title="Authenticate with email & secret password"
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={onToggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ borderRadius: '50%', padding: '0.45rem' }}
          >
            {darkMode ? <Sun size={17} style={{ color: '#f59e0b' }} /> : <Moon size={17} />}
          </button>

          {/* Database Connectivity Indicator */}
          <div 
            className={`status-pill ${isConnected || isCloudDemo ? 'connected' : 'disconnected'}`}
            title={
              isConnected 
                ? `MySQL Connected (${healthStatus?.database_name || 'user_details_db'})` 
                : isCloudDemo
                  ? 'Vercel Cloud Deployment: Running with active interactive demo storage'
                  : (healthStatus?.error || 'Database connection pending')
            }
          >
            <span className="status-dot"></span>
            <span>
              {isConnected 
                ? 'MySQL Online' 
                : isCloudDemo 
                  ? 'Cloud Online' 
                  : 'MySQL Offline'}
            </span>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Reload user list and stats"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onReseed}
            disabled={isReseeding}
            title="Populate or restore sample user data"
          >
            <Database size={15} />
            <span>Seed Sample</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onAddUser}
            title="Create a new user profile"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>
    </header>
  );
}
