// ============================================================
// EDUMARKET — API HELPER
// Centralized API calls with auth header injection
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Get stored token
const getToken = () => {
  try {
    const userData = localStorage.getItem('edumarket_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

// Build headers with optional auth
const buildHeaders = (includeAuth = false, isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic fetch wrapper with retry
const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body, auth = false, isFormData = false, retries = 1 } = options;

  const config = {
    method,
    headers: buildHeaders(auth, isFormData),
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);

      // Try to parse JSON, handle non-JSON responses gracefully
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.ok
            ? 'Unexpected server response'
            : `Server error (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      lastError = error;
      // Provide a user-friendly message for network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        if (attempt === retries) {
          throw new Error('Cannot connect to server. Please make sure the backend is running.');
        }
        // Wait before retry
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      } else {
        // API/business errors — don't retry
        throw error;
      }
    }
  }
  throw lastError;
};

// Helper: check if backend is reachable
export const isBackendAvailable = async () => {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
};

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => apiFetch('/auth/me', { auth: true }),
};

// ============================================================
// NOTES API
// ============================================================
export const notesAPI = {
  // Public
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/notes${query ? '?' + query : ''}`);
  },
  getById: (id) => apiFetch(`/notes/${id}`),
  getBySeller: (sellerId) => apiFetch(`/notes/seller/${sellerId}`),

  // Protected
  create: (formData) => apiFetch('/notes', { method: 'POST', body: formData, auth: true, isFormData: true }),
  update: (id, formData) => apiFetch(`/notes/${id}`, { method: 'PUT', body: formData, auth: true, isFormData: true }),
  delete: (id) => apiFetch(`/notes/${id}`, { method: 'DELETE', auth: true }),
  purchase: (id) => apiFetch(`/notes/${id}/purchase`, { method: 'POST', auth: true }),
  getPurchased: () => apiFetch('/notes/purchased', { auth: true }),
  review: (id, rating, comment) => apiFetch(`/notes/${id}/review`, { method: 'POST', body: { rating, comment }, auth: true }),
  getReviews: (id) => apiFetch(`/notes/${id}/reviews`),
};

// ============================================================
// USERS API
// ============================================================
export const usersAPI = {
  getByUsername: (username) => apiFetch(`/users/${username}`),
  search: (query) => apiFetch(`/users/search?q=${encodeURIComponent(query)}`),
  updateProfile: (formData) => apiFetch('/users/profile', { method: 'PUT', body: formData, auth: true, isFormData: true }),
};

// ============================================================
// CHAT API
// ============================================================
export const chatAPI = {
  getConversations: () => apiFetch('/chat', { auth: true }),
  getMessages: (conversationId) => apiFetch(`/chat/${conversationId}`, { auth: true }),
  createOrGet: (participantId, noteId) =>
    apiFetch('/chat', { method: 'POST', body: { participantId, noteId }, auth: true }),
  sendMessage: (conversationId, text) =>
    apiFetch(`/chat/${conversationId}/message`, { method: 'POST', body: { text }, auth: true }),
};

// ============================================================
// PAYMENTS API (Razorpay)
// ============================================================
export const paymentsAPI = {
  createOrder: (noteId) => apiFetch('/payments/create-order', { method: 'POST', body: { noteId }, auth: true }),
  verify: (payload) => apiFetch('/payments/verify', { method: 'POST', body: payload, auth: true }),
};

// ============================================================
// NOTIFICATIONS API
// ============================================================
export const notificationsAPI = {
  getAll: () => apiFetch('/notifications', { auth: true }),
  getUnreadCount: () => apiFetch('/notifications/unread-count', { auth: true }),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT', auth: true }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT', auth: true }),
  delete: (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE', auth: true }),
};

export default { authAPI, notesAPI, usersAPI, chatAPI, paymentsAPI, notificationsAPI, isBackendAvailable };
