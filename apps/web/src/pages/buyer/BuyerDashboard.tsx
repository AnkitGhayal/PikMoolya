import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Store, ShoppingCart } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/buyer-dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.log('Error loading buyer dashboard:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading Buyer Overview..." />;

  const produce = data?.produce || [];

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>Buyer Overview</h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>Browse direct agricultural listings & AI price benchmarks</p>
        </div>
        <Link to="/marketplace" className="btn-primary">
          <Store size={16} /> Open Marketplace
        </Link>
      </div>

      <div className="grid-3 mb-4">
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>Available Produce Listings</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1B5E20', marginTop: '4px' }}>{produce.length}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>AI Quality Verified</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2B6CB0', marginTop: '4px' }}>100%</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>Active Orders</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DD6B20', marginTop: '4px' }}>0</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1A202C' }}>Recommended Produce Listings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {produce.slice(0, 5).map((item: any, idx: number) => (
            <div key={item.listingId || idx} className="flex-between" style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div>
                <strong style={{ fontSize: '15px', color: '#1A202C' }}>{item.crop?.name || 'Crop'} ({item.crop?.variety || 'Variety'})</strong>
                <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginTop: '2px' }}>
                  Quantity: {item.quantity} {item.unit} | Location: {item.location}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E20' }}>
                  ₹{(item.expectedPrice || 2500).toLocaleString('en-IN')} /{item.unit}
                </span>
                <Link to={`/product/${item.listingId}`} className="btn-primary" style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', padding: '4px 10px' }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
