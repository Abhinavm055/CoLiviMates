import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to attach JWT token to all requests if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('AXIOS REQUEST:', {
      url: `${config.baseURL || ''}${config.url}`,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('AXIOS REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Axios response interceptor to log full response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('AXIOS ERROR RESPONSE:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        data: error.config?.data,
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      } : 'No response from server (Network Error)'
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  verifyUser: async (id, verified) => {
    const response = await api.put(`/auth/users/${id}/verify`, { verified });
    return response.data;
  },
};

// Listings CRUD endpoints
export const listingsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/listings', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};

// Roommate Requests CRUD endpoints
export const roommateRequestsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/roommate-requests', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/roommate-requests/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/roommate-requests', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/roommate-requests/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/roommate-requests/${id}`);
    return response.data;
  },
};

export default api;
