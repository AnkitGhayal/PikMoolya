import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export const FarmerProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/produce');
      setProducts(res.data || []);
    } catch (err: any) {
      console.log('Error loading farmer produce:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>My Produce Products</h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>Manage listed agricultural produce</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary">
          <PlusCircle size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading products..." />
      ) : products.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p style={{ fontSize: '16px', color: '#718096' }}>No products listed yet.</p>
          <Link to="/farmer/products/add" className="btn-primary" style={{ marginTop: '16px' }}>
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Crop Name</th>
                <th style={{ padding: '12px' }}>Quantity</th>
                <th style={{ padding: '12px' }}>Expected Price</th>
                <th style={{ padding: '12px' }}>Measurement</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {item.crop?.name || 'Wheat'} {item.crop?.variety ? `(${item.crop.variety})` : ''}
                  </td>
                  <td style={{ padding: '12px' }}>{item.remainingQuantity ?? item.quantity} {item.unit || 'quintal'}</td>
                  <td style={{ padding: '12px', color: '#1B5E20', fontWeight: 700 }}>
                    ₹{(item.expectedPrice || 2500).toLocaleString('en-IN')} /{item.unit || 'quintal'}
                  </td>
                  <td style={{ padding: '12px' }}>{item.measurementMethod || 'Digital Scale'}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-success">{item.status || 'PUBLISHED'}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/farmer/products/${item.id}/edit`} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        <Edit size={14} /> Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
