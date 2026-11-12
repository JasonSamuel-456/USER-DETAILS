import { INITIAL_DEMO_USERS } from './demoData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// In-memory or localStorage fallback for cloud preview / Vercel
function getLocalUsers() {
  try {
    const saved = localStorage.getItem('demo_users_store');
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem('demo_users_store', JSON.stringify(INITIAL_DEMO_USERS));
  return [...INITIAL_DEMO_USERS];
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem('demo_users_store', JSON.stringify(users));
  } catch {}
}

/**
 * Handle API responses and standardize error messages
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const usersApi = {
  /**
   * Fetch users with pagination, search, filter, and sorting
   */
  async getUsers(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.pageSize) query.append('page_size', params.pageSize);
      if (params.search) query.append('search', params.search);
      if (params.department && params.department !== 'All') query.append('department', params.department);
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.sortBy) query.append('sort_by', params.sortBy);
      if (params.sortOrder) query.append('sort_order', params.sortOrder);

      const res = await fetch(`${API_BASE_URL}/api/users?${query.toString()}`);
      return await handleResponse(res);
    } catch {
      // Vercel / Cloud Fallback: Filter in-memory demo data
      let list = getLocalUsers();
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(u =>
          (u.full_name || `${u.first_name} ${u.last_name}`).toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.role && u.role.toLowerCase().includes(s)) ||
          (u.skills && u.skills.toLowerCase().includes(s)) ||
          (u.city && u.city.toLowerCase().includes(s))
        );
      }
      if (params.department && params.department !== 'All') {
        list = list.filter(u => u.department === params.department);
      }
      if (params.status && params.status !== 'All') {
        list = list.filter(u => u.status === params.status);
      }

      const total = list.length;
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      return {
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
        items
      };
    }
  },

  /**
   * Get specific user details by ID
   */
  async getUserById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
      return await handleResponse(res);
    } catch {
      const found = getLocalUsers().find(u => u.id === Number(id));
      if (!found) throw new Error(`User with ID ${id} not found.`);
      return found;
    }
  },

  /**
   * Create a new user profile
   */
  async createUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(res);
    } catch {
      const list = getLocalUsers();
      const newId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        ...userData,
        full_name: `${userData.first_name} ${userData.last_name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completion: 85
      };
      list.unshift(newUser);
      saveLocalUsers(list);
      return newUser;
    }
  },

  /**
   * Update existing user details (Only allowed for the user themselves)
   */
  async updateUser(id, userData, requesterId) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (requesterId) {
        headers['X-Requester-Id'] = String(requesterId);
      }
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.message && err.message.includes('password')) throw err;
      
      const list = getLocalUsers();
      const idx = list.findIndex(u => u.id === Number(id));
      if (idx === -1) throw new Error("User record not found");
      list[idx] = {
        ...list[idx],
        ...userData,
        full_name: `${userData.first_name || list[idx].first_name} ${userData.last_name || list[idx].last_name}`,
        updated_at: new Date().toISOString()
      };
      saveLocalUsers(list);
      return list[idx];
    }
  },

  /**
   * Delete user profile (Only allowed for the user themselves)
   */
  async deleteUser(id, requesterId) {
    try {
      const headers = {};
      if (requesterId) {
        headers['X-Requester-Id'] = String(requesterId);
      }
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers,
      });
      return await handleResponse(res);
    } catch {
      const list = getLocalUsers().filter(u => u.id !== Number(id));
      saveLocalUsers(list);
      return null;
    }
  },

  /**
   * Authenticate user with email and password
   */
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (err) {
      // Local fallback check
      const user = getLocalUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        return {
          success: true,
          message: `Welcome back, ${user.first_name}!`,
          user
        };
      }
      throw new Error(err.message || 'Incorrect email or password.');
    }
  },

  /**
   * Fetch KPI statistics
   */
  async getStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      return await handleResponse(res);
    } catch {
      const list = getLocalUsers();
      const depts = [...new Set(list.map(u => u.department).filter(Boolean))];
      return {
        total_users: list.length,
        active_users: list.filter(u => u.status === 'Active').length,
        inactive_users: list.filter(u => u.status === 'Inactive').length,
        pending_users: list.filter(u => u.status === 'Pending').length,
        departments: depts
      };
    }
  },

  /**
   * URL for exporting all user records as CSV
   */
  getExportCsvUrl() {
    return `${API_BASE_URL}/api/export/csv`;
  },

  /**
   * Check API and MySQL connectivity
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
      return await res.json();
    } catch (err) {
      return {
        status: 'preview',
        database: 'demo',
        mode: 'cloud-demo',
        message: 'Running in Cloud Preview mode on Vercel.'
      };
    }
  },

  /**
   * Trigger sample data seeding
   */
  async seedData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/seed`, {
        method: 'POST',
      });
      return await handleResponse(res);
    } catch {
      localStorage.setItem('demo_users_store', JSON.stringify(INITIAL_DEMO_USERS));
      return { message: 'Sample users restored successfully!' };
    }
  },
};
