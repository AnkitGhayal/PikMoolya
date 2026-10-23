import React from 'react';
import { Package, Clock, CheckCircle2, AlertCircle, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

export interface OrderItem {
  id: string;
  cropName?: string;
  quantity: number | string;
  agreedPricePerUnit?: number | string;
  price?: number | string;
  expectedGross?: number | string;
  totalAmount?: number | string;
  status: string;
  createdAt: string;
}

export const OrderCard: React.FC<{
  order: OrderItem;
  onUpdateStatus?: (id: string, status: string) => void;
  showActions?: boolean;
}> = ({ order, onUpdateStatus, showActions = true }) => {
  const qty = Number(order.quantity) || 1;
  const unitPrice = Number(order.agreedPricePerUnit || order.price || 2450);
  const amount = Number(order.totalAmount || order.expectedGross || (qty * unitPrice));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="badge badge-success">Delivered & Verified</span>;
      case 'IN_TRANSIT':
      case 'PICKUP_SCHEDULED':
      case 'PICKED_UP':
        return <span className="badge badge-info"><Truck size={12} /> {status.replace('_', ' ')}</span>;
      case 'CONFIRMED':
        return <span className="badge badge-primary"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'PENDING':
      default:
        return <span className="badge badge-warning"><Clock size={12} /> Pending Confirmation</span>;
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="flex-between mb-3">
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.04em' }}>
          ORDER #{order.id.slice(-8).toUpperCase()}
        </span>
        {getStatusBadge(order.status)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0 16px 0' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Package size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {order.cropName || 'Farm Produce'}
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Direct agricultural transaction
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          marginBottom: '16px',
          fontSize: '13px',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block' }}>Quantity:</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}>{qty} quintals</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block' }}>Total Agreed Gross:</span>
          <strong style={{ color: 'var(--primary-dark)', fontSize: '16px', fontFamily: 'var(--font-heading)' }}>
            ₹{amount.toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      <div className="flex-between" style={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontWeight: 600 }}>
          <ShieldCheck size={14} /> Escrow Protected
        </span>
      </div>

      {showActions && onUpdateStatus && order.status === 'PENDING' ? (
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
            className="btn-primary btn-sm"
            style={{ flex: 1.5 }}
          >
            <CheckCircle2 size={14} /> Confirm Order
          </button>
          <button
            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
            className="btn-danger btn-sm"
            style={{ flex: 1 }}
          >
            Decline
          </button>
        </div>
      ) : null}
    </div>
  );
};
