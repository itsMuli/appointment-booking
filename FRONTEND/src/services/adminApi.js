import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        /* ignore */
      }
    }
    return Promise.reject(error);
  }
);

export const appointmentAPI = {
  getAll: (params = {}) => api.get('/appointment', { params }),
  updateStatus: (id, status) => api.patch(`/appointment/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointment/${id}`),
};

export const userAPI = {
  getAll: (params = {}) => api.get('/user/all', { params }),
  update: (id, data) => api.put(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
};

export const artistAPI = {
  getAll: async () => {
    const res = await api.get('/artist');
    if (Array.isArray(res.data)) {
      return { data: { success: true, artists: res.data } };
    }
    return res;
  },
  create: (data) => api.post('/artist/create-artist', data),
  update: (id, data) => api.put(`/artist/${id}`, data),
  delete: (id) => api.delete(`/artist/${id}`),
};

export const serviceAPI = {
  getAll: async () => {
    const res = await api.get('/services');
    if (Array.isArray(res.data)) {
      return { data: { success: true, services: res.data } };
    }
    return res;
  },
  create: (data) => api.post('/services/create-services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const categoryAPI = {
  getAll: async () => {
    const res = await api.get('/categories');
    if (Array.isArray(res.data)) {
      const categories = res.data
        .filter((c) => c.name !== 'ALL')
        .map((c) => ({ _id: c.id || c._id, name: c.name }));
      return { data: { success: true, categories } };
    }
    return res;
  },
  create: (data) => api.post('/categories/create-category', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export default api;
