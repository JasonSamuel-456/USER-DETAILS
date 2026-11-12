import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
];

export default function UserFormModal({ user, onClose, onSave, isSaving }) {
  const isEdit = Boolean(user);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Software Engineer',
    department: 'Engineering',
    address: '',
    city: '',
    country: 'USA',
    status: 'Active',
    is_admin: false,
    avatar_url: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Software Engineer',
        department: user.department || 'Engineering',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'USA',
        status: user.status || 'Active',
        is_admin: Boolean(user.is_admin || false),
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required.';
    
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.role.trim()) errs.role = 'Role is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit My Profile Details' : 'Add New User Profile'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* First Name */}
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. John"
                />
                {errors.first_name && <span className="form-error">{errors.first_name}</span>}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                />
                {errors.last_name && <span className="form-error">{errors.last_name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@example.com"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 000-0000"
                />
              </div>

              {/* Role / Job Title */}
              <div className="form-group">
                <label className="form-label">
                  Role / Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                />
                {errors.role && <span className="form-error">{errors.role}</span>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco"
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  className="form-input"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. USA"
                />
              </div>

              {/* Street Address */}
              <div className="form-group form-full">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 100 Market Street, Suite 400"
                />
              </div>

              {/* Avatar URL */}
              <div className="form-group form-full">
                <label className="form-label">Avatar Image URL (Optional)</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="url"
                    name="avatar_url"
                    className="form-input"
                    style={{ flex: 1 }}
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {formData.avatar_url && (
                    <img
                      src={formData.avatar_url}
                      alt="Preview"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--border-light)',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="form-group form-full">
                <label className="form-label">Bio / Profile Description</label>
                <textarea
                  name="bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief summary of skills, experience, or role..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : isEdit ? 'Update Details' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
