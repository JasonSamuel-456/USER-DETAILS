import React from 'react';
import { X, Mail, Phone, MapPin, Building, Calendar, Edit3, Shield, UserCheck } from 'lucide-react';

export default function UserDetailModal({ user, onClose, onEdit, currentUser }) {
  if (!user) return null;
  const isMe = currentUser && user.id === currentUser.id;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const getInitials = (first, last) => {
    return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge-active';
      case 'inactive':
        return 'badge-inactive';
      case 'pending':
        return 'badge-pending';
      default:
        return 'badge-dept';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Profile Header with Banner */}
        <div className="profile-cover">
          <button
            className="btn-icon"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '0.85rem',
              right: '0.85rem',
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
            }}
          >
            <X size={18} />
          </button>
          <div className="profile-avatar-container">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="profile-avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="profile-avatar-ph"
              style={{ display: user.avatar_url ? 'none' : 'flex' }}
            >
              {getInitials(user.first_name, user.last_name)}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-info">
          <div className="profile-header-meta">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="profile-name">{user.full_name || `${user.first_name} ${user.last_name}`}</h2>
                {isMe && (
                  <span style={{ background: '#4f46e5', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    Your Profile
                  </span>
                )}
              </div>
              <div className="profile-role">{user.role} &bull; {user.department}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                {user.status}
              </span>
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="detail-section">
              <div className="detail-section-title">About / Bio</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {user.bio}
              </p>
            </div>
          )}

          {/* Contact Details */}
          <div className="detail-section">
            <div className="detail-section-title">Contact & Location</div>
            <div className="detail-list">
              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={13} /> Email Address
                </div>
                <div className="detail-item-value">{user.email}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} /> Phone Number
                </div>
                <div className="detail-item-value">{user.phone || 'Not provided'}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} /> Street Address
                </div>
                <div className="detail-item-value">{user.address || 'Not provided'}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} /> City & Country
                </div>
                <div className="detail-item-value">
                  {[user.city, user.country].filter(Boolean).join(', ') || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* System & Audit Details */}
          <div className="detail-section" style={{ marginBottom: 0 }}>
            <div className="detail-section-title">System & Audit Info</div>
            <div className="detail-list">
              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Shield size={13} /> MySQL Record ID
                </div>
                <div className="detail-item-value">#{user.id}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={13} /> Department
                </div>
                <div className="detail-item-value">{user.department}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> Date Registered
                </div>
                <div className="detail-item-value">{formatDate(user.created_at)}</div>
              </div>

              <div>
                <div className="detail-item-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> Last Updated
                </div>
                <div className="detail-item-value">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {isMe ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
            >
              <Edit3 size={15} />
              <span>Edit My Profile</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginRight: 'auto' }}>
              Viewing another member's profile (Read-only)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
