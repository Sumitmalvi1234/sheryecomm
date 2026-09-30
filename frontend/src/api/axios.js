import axios from 'axios';

const baseBackendURL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'https://onrender.com';

const API = axios.create({
  baseURL: baseBackendURL,
  withCredentials: true, 
});

// Automatically format URLs and inject the access token
API.interceptors.request.use((config) => {
  if (config.url) {
    // 💡 FIX: Safely route authentication calls into the backend's /api/auth folder structure
    if ((config.url.includes('login') || config.url.includes('register') || config.url.includes('refresh-token')) && !config.url.includes('/api/auth')) {
      // Strips leading slash if present to prevent double slash errors
      const cleanUrl = config.url.startsWith('/') ? config.url.substring(1) : config.url;
      config.url = `/api/auth/${cleanUrl}`;
    } 
    // Fallback rule for regular product routes
    else if (!config.url.startsWith('/api')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
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
