import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Package, TrendingUp, Award, ShoppingCart, PlusCircle } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/farmer-dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.log('Error loading farmer dashboard:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading Farmer Dashboard..." />;

  const listings = data?.produce?.activeListings || data?.produce?.listings || [];

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>Farmer Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#718096' }}>Manage listings, AI price discovery & orders</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary">
          <PlusCircle size={16} /> Add New Produce
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>Active Listings</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1B5E20', marginTop: '4px' }}>{listings.length}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>AI Quality Proofs</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2B6CB0', marginTop: '4px' }}>{listings.length}</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>Pending Orders</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DD6B20', marginTop: '4px' }}>1</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#718096' }}>Fair Price Index</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#22543D', marginTop: '4px' }}>Live</div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <Link to="/farmer/prediction" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
          <TrendingUp size={32} color="#1B5E20" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1B5E20' }}>AI Fair Price Calculator</h3>
            <p style={{ fontSize: '12px', color: '#2E7D32' }}>Calculate benchmark prices before selling</p>
          </div>
        </Link>

        <Link to="/farmer/quality" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#EBF8FF', border: '1px solid #BEE3F8' }}>
          <Award size={32} color="#2B6CB0" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2B6CB0' }}>Upload Crop Photo for Quality Assessment</h3>
            <p style={{ fontSize: '12px', color: '#2C5282' }}>Generate Grade A/B/C computer vision reports</p>
          </div>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1A202C' }}>My Recent Produce Listings</h3>
        {listings.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#718096' }}>No active listings. Click "Add New Produce" to start selling.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {listings.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex-between" style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#1A202C' }}>{item.crop?.name || 'Crop'} ({item.crop?.variety || 'Standard'})</strong>
                  <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginTop: '2px' }}>
                    Available: {item.remainingQuantity ?? item.quantity} {item.unit || 'quintal'} | Location: {item.locationApproximate || 'Pune'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E20' }}>
                    ₹{(item.expectedPrice || 2500).toLocaleString('en-IN')} /{item.unit || 'quintal'}
                  </span>
                  <span className="badge badge-success" style={{ display: 'block', marginTop: '4px' }}>
                    {item.status || 'PUBLISHED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
