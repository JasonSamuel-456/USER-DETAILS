const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('page_size', params.pageSize);
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.sortBy) query.append('sort_by', params.sortBy);
    if (params.sortOrder) query.append('sort_order', params.sortOrder);

    const res = await fetch(`${API_BASE_URL}/api/users?${query.toString()}`);
    return handleResponse(res);
  },

  /**
   * Get specific user details by ID
   */
  async getUserById(id) {
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
    return handleResponse(res);
  },

  /**
   * Create a new user profile
   */
  async createUser(userData) {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  /**
   * Update existing user details (Only allowed for the user themselves)
   */
  async updateUser(id, userData, requesterId) {
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
    return handleResponse(res);
  },

  /**
   * Delete user profile (Only allowed for the user themselves)
   */
  async deleteUser(id, requesterId) {
    const headers = {};
    if (requesterId) {
      headers['X-Requester-Id'] = String(requesterId);
    }
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },

  /**
   * Fetch KPI statistics
   */
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    return handleResponse(res);
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
        status: 'disconnected',
        database: 'disconnected',
        error: err.message || 'Cannot reach FastAPI backend server.',
      };
    }
  },

  /**
   * Trigger sample data seeding
   */
  async seedData() {
    const res = await fetch(`${API_BASE_URL}/api/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
