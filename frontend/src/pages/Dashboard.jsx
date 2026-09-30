import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // 1. Fetch all products from the backend on load
  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle text input field updates
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // 3. Handle Submit (Both Create and Update operations)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    try {
      if (editingId) {
        // PUT Request to update an existing product
        await API.put(`/products/${editingId}`, formData);
        setEditingId(null);
      } else {
        // POST Request to create a new product
        await API.post('/products', formData);
      }
      
      // Reset form fields and refresh listings
      setFormData({ name: '', description: '', price: '', stock: '', category: '' });
      fetchProducts();
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.errors) {
        // Intercept express-validator errors and map them to fields
        const mappedErrors = {};
        err.response.data.errors.forEach((error) => {
          mappedErrors[error.field] = error.message;
        });
        setErrors(mappedErrors);
      } else {
        setServerError('Action failed. Please check backend logging validations.');
      }
    }
  };

  // 4. Populate form fields to toggle edit mode
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
    });
  };

  // 5. Delete a product record
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  // 6. Secure Logout implementation (Clears state, database tokens, and cookies)
  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  return (
  
  <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', minHeight: '100vh' }}>
    
    {/* Upper Navigation Header Bar */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2f3336', paddingBottom: '20px', marginBottom: '40px' }}>
      <h2 style={{ margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🛍️</span> E-Commerce Control Center
      </h2>
      <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#e02424', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: '0.2s', fontSize: '14px' }}>
        Logout Session
      </button>
    </div>

    {serverError && (
      <div style={{ background: 'rgba(224, 36, 36, 0.1)', border: '1px solid #e02424', color: '#f98080', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>
        ⚠️ {serverError}
      </div>
    )}

    {/* Grid Dashboard Layout Framework */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: Manage Product Entry Forms */}
      <div style={{ padding: '28px', border: '1px solid #2f3336', borderRadius: '12px', background: '#1a1a1e', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 24px 0', color: '#ffffff', borderBottom: '1px solid #2f3336', paddingBottom: '12px', fontSize: '18px' }}>
          {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Product Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#242428', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
            {errors.name && <span style={{ color: '#f98080', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Category:</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#242428', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
            {errors.category && <span style={{ color: '#f98080', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
          </div>

          <div style={{ marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Price ($):</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#242428', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
              {errors.price && <span style={{ color: '#f98080', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.price}</span>}
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Stock Count:</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#242428', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '6px', outline: 'none', fontSize: '14px' }} />
              {errors.stock && <span style={{ color: '#f98080', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.stock}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Description Details:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '10px', background: '#242428', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '6px', outline: 'none', fontSize: '14px', resize: 'vertical' }}></textarea>
            {errors.description && <span style={{ color: '#f98080', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.description}</span>}
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: editingId ? '#eab308' : '#2563eb', color: editingId ? '#1e1b4b' : '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s' }}>
            {editingId ? 'Update Product Record' : 'Save Product Entry'}
          </button>
          
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', stock: '', category: '' }); }} style={{ width: '100%', padding: '10px', marginTop: '10px', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* RIGHT COLUMN: Live Product Listing Inventory */}
      <div>
        <h3 style={{ margin: '0 0 24px 0', color: '#ffffff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📦</span> Current Live Inventory ({products.length})
        </h3>
        
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #2f3336', borderRadius: '12px', color: '#71717a' }}>
            <p style={{ margin: 0, fontStyle: 'italic' }}>No products available. Add your first item using the management control form panel.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {products.map((product) => (
              <div key={product._id} style={{ border: '1px solid #2f3336', borderRadius: '12px', padding: '20px', background: '#1a1a1e', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>{product.name}</h4>
                    <span style={{ fontSize: '11px', background: '#2563eb', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      {product.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 20px 0', lineHeight: '1.5' }}>{product.description}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #2f3336', borderBottom: '1px solid #2f3336', marginBottom: '20px', fontSize: '14px', color: '#d4d4d8' }}>
                    <span>Price: <strong style={{ color: '#ffffff', fontSize: '15px' }}>${product.price}</strong></span>
                    <span>Stock: <strong style={{ color: product.stock < 5 ? '#ef4444' : '#22c55e' }}>{product.stock} units</strong></span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleEditClick(product)} style={{ flex: 1, padding: '8px', background: '#eab308', color: '#1e1b4b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)} style={{ flex: 1, padding: '8px', background: '#e02424', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
);

};

export default Dashboard;
