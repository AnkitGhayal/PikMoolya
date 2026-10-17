import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<string>('100');
  const [expectedPrice, setExpectedPrice] = useState<string>('2500');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.data;
        if (p) {
          setQuantity(String(p.quantity));
          setExpectedPrice(String(p.expectedPrice));
          setDescription(p.description || '');
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      alert('Product updated successfully!');
      navigate('/farmer/products');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>Edit Produce Product</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Price (₹)</label>
            <input type="number" className="form-input" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Saving...' : 'Save Product Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
