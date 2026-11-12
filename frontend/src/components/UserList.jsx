import React from 'react';
import { Mail, Phone, MapPin, Eye, Edit3, Trash2, UserPlus, Sparkles } from 'lucide-react';

export default function UserList({
  users = [],
  loading,
  viewMode,
  onViewDetails,
  onEditUser,
  onDeleteUser,
  onAddUser,
  onReseed,
}) {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Loading user details from MySQL database...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="table-container empty-state">
        <div className="empty-icon">
          <UserPlus size={28} />
        </div>
        <h3 className="empty-title">No Users Found</h3>
        <p className="empty-subtitle">
          No user records matched your search filters or the database is currently empty.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onReseed}>
            <Sparkles size={16} />
            <span>Load Sample Users</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onAddUser}>
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </div>
    );
  }

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

  /* Render Grid View */
  if (viewMode === 'grid') {
    return (
      <div className="cards-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div>
              <div className="user-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="user-avatar-placeholder"
                    style={{ display: user.avatar_url ? 'none' : 'flex' }}
                  >
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div>
                    <h4 className="user-info-name">{user.full_name || `${user.first_name} ${user.last_name}`}</h4>
                    <p className="user-info-role">{user.role}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                  {user.status}
                </span>
              </div>

              <div className="user-card-body">
                <div className="contact-item">
                  <Mail size={15} className="contact-icon" />
                  <span style={{ wordBreak: 'break-all' }}>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="contact-item">
                    <Phone size={15} className="contact-icon" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {(user.city || user.country) && (
                  <div className="contact-item">
                    <MapPin size={15} className="contact-icon" />
                    <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div style={{ marginTop: '0.4rem' }}>
                  <span className="badge badge-dept">{user.department}</span>
                </div>
              </div>
            </div>

            <div className="user-card-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onViewDetails(user)}
              >
                <Eye size={15} />
                <span>Details</span>
              </button>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className="btn-icon"
                  title="Edit user"
                  onClick={() => onEditUser(user)}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="btn-icon danger"
                  title="Delete user"
                  onClick={() => onDeleteUser(user)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* Render Table View */
  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Email & Contact</th>
              <th>Department</th>
              <th>Status</th>
              <th>Location</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="user-avatar-placeholder"
                      style={{ display: user.avatar_url ? 'none' : 'flex' }}
                    >
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                    <div>
                      <div className="user-info-name">
                        {user.full_name || `${user.first_name} ${user.last_name}`}
                      </div>
                      <div className="user-info-role">{user.role}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{user.email}</div>
                  {user.phone && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {user.phone}
                    </div>
                  )}
                </td>
                <td>
                  <span className="badge badge-dept">{user.department}</span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {[user.city, user.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewDetails(user)}
                      title="View full details"
                    >
                      <Eye size={15} />
                      <span>View</span>
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onEditUser(user)}
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => onDeleteUser(user)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
