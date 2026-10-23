import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Edit3, CheckCircle2 } from 'lucide-react';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [cropName, setCropName] = useState<string>('Produce');
  const [quantity, setQuantity] = useState<string>('100');
  const [unit, setUnit] = useState<string>('quintal');
  const [expectedPrice, setExpectedPrice] = useState<string>('2450');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.data;
        if (p) {
          setCropName(p.cropName || 'Produce');
          setQuantity(String(p.quantity || 100));
          setUnit(p.unit || 'quintal');
          setExpectedPrice(String(p.expectedPrice || 2450));
          setDescription(p.description || '');
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.patch(`/produce/${id}`, {
        quantity: Number(quantity),
        expectedPrice: Number(expectedPrice),
        qualityDescription: description,
      });
      success('Produce Listing Updated', `Changes to ${cropName} were saved.`);
      navigate('/farmer/products');
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Product update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
        <Link to="/farmer/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={14} /> My Produce
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Edit {cropName}</span>
      </div>

      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Edit Produce Listing
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Modify available quantity, expected ask price, or harvest description
        </p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Available Quantity ({unit})</label>
            <input
              type="number"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Ask Price (₹/{unit})</label>
            <input
              type="number"
              className="form-input"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Produce Description & Storage Info</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Update grain storage conditions or notes..."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 1.5 }}
            >
              <Edit3 size={16} /> {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
