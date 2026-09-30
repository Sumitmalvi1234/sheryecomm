import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    try {
      const res = await API.post('/auth/login', formData);
      
      // Store short-lived access token in localStorage
      localStorage.setItem('accessToken', res.data.accessToken);
      
      // Redirect to protected operational landing interface
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.errors) {
        const mappedErrors = {};
        err.response.data.errors.forEach((error) => {
          mappedErrors[error.field] = error.message;
        });
        setErrors(mappedErrors);
      } else if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        // Handles security requirement: generic output display parameters
        setServerError(err.response.data.message);
      } else {
        setServerError('Authentication failed. Check details.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login Securely</h2>
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email Address:</label>
          <input type="text" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          {errors.password && <span style={{ color: 'red', fontSize: '12px' }}>{errors.password}</span>}
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login Session
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        New user? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
