import React from 'react';
import { Users, Plus, RefreshCw, Database, ShieldCheck, Lock, User } from 'lucide-react';

export default function Navbar({ 
  onAddUser, 
  healthStatus, 
  onRefresh, 
  isRefreshing, 
  onReseed,
  isReseeding,
  currentRole = 'Admin',
  onRoleChange
}) {
  const isConnected = healthStatus?.database === 'connected';
  const isAdmin = currentRole === 'Admin';

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
          {/* Active Role Switcher (RBAC Toggle) */}
          <div className="role-switcher-container" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', padding: '3px 6px', borderRadius: '20px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', paddingLeft: '4px' }}>
              Mode:
            </span>
            <button
              type="button"
              onClick={() => onRoleChange('Admin')}
              className={`role-pill-btn ${isAdmin ? 'active-admin' : ''}`}
              title="Admin Mode: Full permission to edit and manage user details"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                border: 'none',
                background: isAdmin ? '#4f46e5' : 'transparent',
                color: isAdmin ? '#ffffff' : '#64748b',
                padding: '3px 10px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ShieldCheck size={13} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('User')}
              className={`role-pill-btn ${!isAdmin ? 'active-user' : ''}`}
              title="Standard User Mode: Read-only access. Cannot edit others' information."
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                border: 'none',
                background: !isAdmin ? '#0284c7' : 'transparent',
                color: !isAdmin ? '#ffffff' : '#64748b',
                padding: '3px 10px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <User size={13} />
              <span>Standard User</span>
            </button>
          </div>

          {/* Database Connectivity Indicator */}
          <div 
            className={`status-pill ${isConnected ? 'connected' : 'disconnected'}`}
            title={
              isConnected 
                ? `MySQL Connected (${healthStatus?.database_name || 'user_details_db'})` 
                : (healthStatus?.error || 'Database connection pending')
            }
          >
            <span className="status-dot"></span>
            <span>{isConnected ? 'MySQL Online' : 'MySQL Offline'}</span>
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
            <span>Seed Sample Data</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={onAddUser}
            disabled={!isAdmin}
            title={isAdmin ? "Create a new user" : "Only Admins can add users"}
            style={{ opacity: !isAdmin ? 0.6 : 1 }}
          >
            {isAdmin ? <Plus size={18} strokeWidth={2.4} /> : <Lock size={15} />}
            <span>Add User</span>
          </button>
        </div>
      </div>
    </header>
  );
}
