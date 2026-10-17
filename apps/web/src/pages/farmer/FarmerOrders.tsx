import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { OrderCard, OrderItem } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err: any) {
      console.log('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      alert(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>Received Orders</h1>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p style={{ fontSize: '16px', color: '#718096' }}>No orders received yet.</p>
        </div>
      ) : (
        <div className="grid-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
};
