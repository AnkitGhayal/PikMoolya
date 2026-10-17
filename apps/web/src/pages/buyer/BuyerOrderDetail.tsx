import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react';

export const BuyerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.log('Error fetching order:', err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading order details..." />;
  if (!order) return <div className="container" style={{ padding: '48px' }}>Order not found.</div>;

  const statuses = ['PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED'];
  const currentIndex = statuses.indexOf(order.status);

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate('/buyer/orders')} className="btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1B5E20' }}>Order #{order.id.slice(-8)}</h1>
            <p style={{ fontSize: '13px', color: '#718096' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          <span className="badge badge-success" style={{ fontSize: '13px' }}>{order.status}</span>
        </div>

        {/* Status Tracker */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#2D3748', marginBottom: '16px' }}>Order Progress Tracker</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {statuses.map((st, idx) => {
              const completed = idx <= currentIndex;
              return (
                <div key={st} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: completed ? '#1B5E20' : '#CBD5E0', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontSize: '12px', fontWeight: 700 }}>
                    {completed ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: completed ? 700 : 500, color: completed ? '#1B5E20' : '#718096' }}>{st}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#718096' }}>Quantity Ordered:</span>
            <strong style={{ display: 'block', color: '#2D3748' }}>{order.quantity} quintals</strong>
          </div>
          <div>
            <span style={{ color: '#718096' }}>Agreed Price per Unit:</span>
            <strong style={{ display: 'block', color: '#1B5E20' }}>₹{(order.agreedPricePerUnit || 2500).toLocaleString('en-IN')} / quintal</strong>
          </div>
          <div>
            <span style={{ color: '#718096' }}>Expected Gross Amount:</span>
            <strong style={{ display: 'block', color: '#1B5E20' }}>₹{(order.expectedGross || order.quantity * 2500).toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span style={{ color: '#718096' }}>Payment Status:</span>
            <strong style={{ display: 'block', color: '#2B6CB0' }}>At Delivery (Escrow Protected)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
