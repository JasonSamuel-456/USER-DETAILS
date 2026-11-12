import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

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
    skills: 'Full Stack, React, FastAPI, MySQL',
    department: 'Engineering',
    address: '',
    city: '',
    country: 'USA',
    status: 'Active',
    avatar_url: '',
    bio: '',
    linkedin_url: '',
    current_password: '',
    new_password: '',
    password: '',
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Software Engineer',
        skills: user.skills || 'Full Stack, React, FastAPI, MySQL',
        department: user.department || 'Engineering',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'USA',
        status: user.status || 'Active',
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        current_password: '',
        new_password: '',
        password: '',
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

    if (isEdit) {
      if (!formData.current_password) {
        errs.current_password = 'Your secret password is required to save profile changes.';
      }
      if (formData.new_password && formData.new_password.length < 4) {
        errs.new_password = 'New password must be at least 4 characters long.';
      }
    } else {
      if (!formData.password) {
        errs.password = 'A password is required for this new account.';
      } else if (formData.password.length < 4) {
        errs.password = 'Password must be at least 4 characters long.';
      }
    }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} style={{ color: '#4f46e5' }} />
            <h3 className="modal-title">{isEdit ? 'Edit My Profile Details' : 'Create New User Profile'}</h3>
          </div>
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

              {/* Skills & Technologies */}
              <div className="form-group form-full">
                <label className="form-label">Skills & Tech Stack</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React 19, Python, FastAPI, MySQL, Tailwind CSS"
                />
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

              {/* LinkedIn URL */}
              <div className="form-group">
                <label className="form-label">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  name="linkedin_url"
                  className="form-input"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
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

              {/* SECURITY: Password Section */}
              <div 
                className="form-group form-full" 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Lock size={16} style={{ color: '#4f46e5' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    {isEdit ? 'Password Authorization (Required to Save)' : 'Account Security Password'}
                  </span>
                </div>

                {isEdit ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Current Password Field */}
                    <div>
                      <label className="form-label">
                        Enter Your Secret Password <span className="req">*</span>
                      </label>
                      <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          name="current_password"
                          className="form-input"
                          style={{ width: '100%', paddingRight: '2.5rem' }}
                          value={formData.current_password}
                          onChange={handleChange}
                          placeholder="Enter your current password to authorize edits"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.current_password && <span className="form-error">{errors.current_password}</span>}
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                        🔒 <em>Default demo password: <strong>{user?.first_name?.toLowerCase()}123</strong></em>
                      </p>
                    </div>

                    {/* Change Password (Optional) */}
                    <div>
                      <label className="form-label">Change Password (Optional)</label>
                      <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          name="new_password"
                          className="form-input"
                          style={{ width: '100%', paddingRight: '2.5rem' }}
                          value={formData.new_password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer'
                          }}
                        >
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.new_password && <span className="form-error">{errors.new_password}</span>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">
                      Choose Profile Password <span className="req">*</span>
                    </label>
                    <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                      <input
                        type={showCreatePw ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a secret password to protect your profile"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePw(!showCreatePw)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {showCreatePw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <span className="form-error">{errors.password}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              <span>{isSaving ? 'Verifying & Saving...' : isEdit ? 'Save Changes' : 'Create Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
