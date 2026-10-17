import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { OrderCard, OrderItem } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const BuyerOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.log('Error fetching buyer orders:', err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>My Order History</h1>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p style={{ fontSize: '16px', color: '#718096' }}>No orders placed yet.</p>
          <Link to="/marketplace" className="btn-primary" style={{ marginTop: '16px' }}>
            Browse Marketplace to Order
          </Link>
        </div>
      ) : (
        <div className="grid-2">
          {orders.map((order) => (
            <div key={order.id}>
              <OrderCard order={order} />
              <Link to={`/buyer/orders/${order.id}`} className="btn-secondary" style={{ width: '100%', fontSize: '12px', marginTop: '6px' }}>
                Track Order Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
