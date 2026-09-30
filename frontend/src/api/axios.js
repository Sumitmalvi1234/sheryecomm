import axios from 'axios';

// 🚀 Hardcoded direct link to your live backend's api folder
const API = axios.create({
  baseURL: 'https://onrender.com',
  withCredentials: true, 
});

// Clean token injection interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handling token session expiration gracefully
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          'https://onrender.com/auth/refresh-token', 
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
