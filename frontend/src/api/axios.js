import axios from 'axios';

const API = axios.create({
  // ✅ FIX 1: Point to your correct backend URL with the mandatory /api route layer
  baseURL: 'https://onrender.com',
  withCredentials: true, // Crucial: Allows sending/receiving HTTP-Only cookies securely
});

// Automatically inject the short-lived access token into every single request header
API.interceptors.request.use((config) => {
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
    
    // If the access token expires (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // ✅ FIX 2: Point the token refresh request to the live backend server
        const res = await axios.post(
          'https://onrender.com/auth/refresh-token', 
          {}, 
          { withCredentials: true }
        );
        const { accessToken } = res.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return API(originalRequest); // Retry the original failed request
      } catch (refreshError) {
        // If refresh token is also expired or invalid, log out the user entirely
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
