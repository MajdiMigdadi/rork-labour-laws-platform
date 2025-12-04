/**
 * API Configuration and Base Service
 * 
 * Change API_BASE_URL to your backend server URL
 */

// ⚠️ CONFIGURATION - Change these values!
const CONFIG = {
  // Set to true when you have a real backend
  USE_REAL_API: true,
  
  // Your backend API URL
  // For local development: 'http://localhost:8000/api'
  // For production: 'https://dlilk.me/api/public/api'
  API_URL: 'https://dlilk.me/api/public/api',
};

// Log API URL for debugging
console.log('🔗 API URL:', CONFIG.API_URL);

const API_BASE_URL = CONFIG.API_URL;

// Export config for use in other files
export const API_CONFIG = CONFIG;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

// Get auth token from storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Base API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<{ user: any; token: string }>('/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<{ user: any; token: string }>('/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  logout: () =>
    apiRequest('/logout', { method: 'POST' }),

  getProfile: () =>
    apiRequest<any>('/user'),

  updateProfile: (data: any) =>
    apiRequest<any>('/user', {
      method: 'PUT',
      body: data,
    }),
};

// ============================================
// COUNTRIES API
// ============================================
export const countriesAPI = {
  getAll: () =>
    apiRequest<any[]>('/countries'),

  getById: (id: string) =>
    apiRequest<any>(`/countries/${id}`),

  create: (data: any) =>
    apiRequest<any>('/countries', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/countries/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/countries/${id}`, { method: 'DELETE' }),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesAPI = {
  getAll: () =>
    apiRequest<any[]>('/categories'),

  getById: (id: string) =>
    apiRequest<any>(`/categories/${id}`),

  create: (data: any) =>
    apiRequest<any>('/categories', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/categories/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// LAWS API
// ============================================
export const lawsAPI = {
  getAll: (params?: { countryId?: string; categoryId?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.countryId) queryParams.append('country_id', params.countryId);
    if (params?.categoryId) queryParams.append('category_id', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return apiRequest<any[]>(`/laws${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/laws/${id}`),

  create: (data: any) =>
    apiRequest<any>('/laws', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/laws/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/laws/${id}`, { method: 'DELETE' }),
};

// ============================================
// QUESTIONS API
// ============================================
export const questionsAPI = {
  getAll: (params?: { countryId?: string; categoryId?: string; search?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.countryId) queryParams.append('country_id', params.countryId);
    if (params?.categoryId) queryParams.append('category_id', params.categoryId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return apiRequest<any[]>(`/questions${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiRequest<any>(`/questions/${id}`),

  create: (data: any) =>
    apiRequest<any>('/questions', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/questions/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/questions/${id}`, { method: 'DELETE' }),

  // Answers
  getAnswers: (questionId: string) =>
    apiRequest<any[]>(`/questions/${questionId}/answers`),

  addAnswer: (questionId: string, content: string) =>
    apiRequest<any>(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: { content },
    }),

  acceptAnswer: (questionId: string, answerId: string) =>
    apiRequest<any>(`/questions/${questionId}/answers/${answerId}/accept`, {
      method: 'POST',
    }),

  // Votes
  upvote: (id: string) =>
    apiRequest(`/questions/${id}/upvote`, { method: 'POST' }),

  downvote: (id: string) =>
    apiRequest(`/questions/${id}/downvote`, { method: 'POST' }),
};

// ============================================
// USERS API (Admin)
// ============================================
export const usersAPI = {
  getAll: () =>
    apiRequest<any[]>('/users'),

  getById: (id: string) =>
    apiRequest<any>(`/users/${id}`),

  update: (id: string, data: any) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),

  updateRole: (id: string, role: string) =>
    apiRequest<any>(`/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    }),
};

// ============================================
// CONTACT/MESSAGES API
// ============================================
export const messagesAPI = {
  getAll: () =>
    apiRequest<any[]>('/messages'),

  getById: (id: string) =>
    apiRequest<any>(`/messages/${id}`),

  send: (data: { name: string; email: string; subject: string; message: string }) =>
    apiRequest<any>('/messages', {
      method: 'POST',
      body: data,
    }),

  reply: (id: string, reply: string) =>
    apiRequest<any>(`/messages/${id}/reply`, {
      method: 'POST',
      body: { reply },
    }),

  markAsRead: (id: string) =>
    apiRequest(`/messages/${id}/read`, { method: 'PATCH' }),

  delete: (id: string) =>
    apiRequest(`/messages/${id}`, { method: 'DELETE' }),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsAPI = {
  get: () =>
    apiRequest<any>('/settings'),

  update: (data: any) =>
    apiRequest<any>('/settings', {
      method: 'PUT',
      body: data,
    }),

  uploadLogo: (formData: FormData) =>
    fetch(`${API_BASE_URL}/settings/logo`, {
      method: 'POST',
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    }).then(res => res.json()),
};

// ============================================
// FAVORITES API
// ============================================
export const favoritesAPI = {
  getLaws: () =>
    apiRequest<any[]>('/favorites/laws'),

  getQuestions: () =>
    apiRequest<any[]>('/favorites/questions'),

  addLaw: (lawId: string) =>
    apiRequest('/favorites/laws', {
      method: 'POST',
      body: { law_id: lawId },
    }),

  removeLaw: (lawId: string) =>
    apiRequest(`/favorites/laws/${lawId}`, { method: 'DELETE' }),

  addQuestion: (questionId: string) =>
    apiRequest('/favorites/questions', {
      method: 'POST',
      body: { question_id: questionId },
    }),

  removeQuestion: (questionId: string) =>
    apiRequest(`/favorites/questions/${questionId}`, { method: 'DELETE' }),
};

// ============================================
// STATISTICS API (Admin Dashboard)
// ============================================
export const statsAPI = {
  getDashboard: () =>
    apiRequest<{
      totalUsers: number;
      totalLaws: number;
      totalQuestions: number;
      totalCountries: number;
      recentActivity: any[];
    }>('/stats/dashboard'),

  getUserStats: (userId: string) =>
    apiRequest<any>(`/stats/users/${userId}`),
};

export default {
  auth: authAPI,
  countries: countriesAPI,
  categories: categoriesAPI,
  laws: lawsAPI,
  questions: questionsAPI,
  users: usersAPI,
  messages: messagesAPI,
  settings: settingsAPI,
  favorites: favoritesAPI,
  stats: statsAPI,
};

