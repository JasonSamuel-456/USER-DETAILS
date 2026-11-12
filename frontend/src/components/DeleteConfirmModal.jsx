import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ user, onClose, onConfirm, isDeleting }) {
  if (!user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Are you sure you want to permanently delete user record:
          </p>
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {user.full_name || `${user.first_name} ${user.last_name}`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              ID: #{user.id} &bull; {user.role} ({user.department})
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>
            This action cannot be undone and will remove the record directly from your MySQL table.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onConfirm(user.id)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
