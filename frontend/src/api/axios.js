import axios from 'axios';

// Automatically fallback if one configuration type isn't recognized by your bundler
const baseBackendURL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'https://sheryians-backend.onrender.com';

const API = axios.create({
  baseURL: baseBackendURL,
  withCredentials: true, 
});

// Automatically inject /api and the access token into every single request
API.interceptors.request.use((config) => {
  // Force the /api layer onto all incoming request paths automatically
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration (automatic refresh token call)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${baseBackendURL}/api/auth/refresh-token`, 
          {}, 
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return API(originalRequest); 
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
