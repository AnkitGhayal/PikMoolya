import React from 'react';
import { Package, Clock, CheckCircle } from 'lucide-react';

export interface OrderItem {
  id: string;
  cropName?: string;
  quantity: number;
  agreedPricePerUnit?: number;
  price?: number;
  expectedGross?: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
}

export const OrderCard: React.FC<{ order: OrderItem; onUpdateStatus?: (id: string, status: string) => void }> = ({
  order,
  onUpdateStatus,
}) => {
  const amount = order.totalAmount || order.expectedGross || (order.quantity * (order.agreedPricePerUnit || order.price || 0));

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#718096' }}>Order ID: #{order.id.slice(-8)}</span>
        <span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
        <Package size={18} color="#1B5E20" />
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A202C' }}>
          {order.cropName || 'Agricultural Produce'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', margin: '8px 0' }}>
        <div>
          <span style={{ color: '#718096' }}>Quantity:</span>
          <strong style={{ display: 'block', color: '#2D3748' }}>{order.quantity} quintals</strong>
        </div>
        <div>
          <span style={{ color: '#718096' }}>Total Amount:</span>
          <strong style={{ display: 'block', color: '#1B5E20' }}>₹{amount.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN')}
      </div>

      {onUpdateStatus && order.status === 'PENDING' ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={() => onUpdateStatus(order.id, 'CONFIRMED')} className="btn-primary" style={{ flex: 1, fontSize: '12px', padding: '6px' }}>
            Confirm Order
          </button>
          <button onClick={() => onUpdateStatus(order.id, 'CANCELLED')} className="btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '6px' }}>
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
};
