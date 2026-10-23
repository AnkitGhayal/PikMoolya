import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Package, 
  MapPin, 
  FileText, 
  Phone, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const CROP_IMAGES: Record<string, string> = {
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  cotton: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
  soybean: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=600&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  jowar: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  bajra: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';

export const BuyerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => {
          console.error('Error fetching order:', err.message);
          showToast('Could not load order details', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner message="Retrieving secure order transaction..." />;
  
  if (!order) {
    return (
      <div className="container" style={{ padding: '48px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '36px' }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Order Not Found</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            The order ID does not exist or you do not have permission to view it.
          </p>
          <button onClick={() => navigate('/buyer/orders')} className="btn-primary" style={{ width: '100%' }}>
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  const milestones = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Awaiting farmer dispatch confirmation', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Lot locked & verified', icon: CheckCircle2 },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Ready', desc: 'APMC mandi logistics assigned', icon: Package },
    { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Consignment en route to hub', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Quality verified & payment released', icon: ShieldCheck },
  ];

  const currentStatusIndex = milestones.findIndex(m => m.key === order.status);
  const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 0;

  const cropName = order.listing?.crop?.name || 'Agricultural Produce';
  const cropImage = CROP_IMAGES[cropName.toLowerCase()] || DEFAULT_IMAGE;
  const grade = order.listing?.qualityGrade || 'Grade A';
  const unitPrice = order.agreedPricePerUnit || 2500;
  const grossAmount = order.expectedGross || (order.quantity * unitPrice);

  const handleDownloadInvoice = () => {
    showToast(`Invoice receipt downloaded for Order #${order.id.slice(0, 8).toUpperCase()}`, 'success');
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/buyer/orders')} 
          className="btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>
        <button 
          onClick={handleDownloadInvoice} 
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
        >
          <FileText size={15} color="#15803d" /> Download Invoice
        </button>
      </div>

      {/* Main Order Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '28px' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className="badge badge-success" style={{ fontSize: '12px' }}>
                {order.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> Direct Farm Pickup (Mandi Hub)
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Agreed Amount</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d' }}>
              ₹{grossAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div style={{ margin: '28px 0', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#15803d" /> Live Fulfillment Tracker
            </h3>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
              Milestone {activeIndex + 1} of {milestones.length}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${milestones.length}, 1fr)`, gap: '8px', position: 'relative' }}>
            {milestones.map((m, idx) => {
              const isDone = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              const IconComp = m.icon;

              return (
                <div key={m.key} style={{ textAlign: 'center', position: 'relative' }}>
                  <div 
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: isDone ? '#15803d' : '#e2e8f0', 
                      color: isDone ? '#ffffff' : '#94a3b8', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 10px auto', 
                      fontSize: '13px', 
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(21, 128, 61, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComp size={18} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#94a3b8', marginBottom: '2px' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.3, display: 'none' /* hidden on very small */ }}>
                    {m.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout: Produce Details & Settlement Security */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Produce Summary */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              Produce Specifications
            </h4>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
              <img 
                src={cropImage} 
                alt={cropName} 
                style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} 
              />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {cropName}
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-success" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {grade}
                  </span>
                  <span className="badge" style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                    CV Verified
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Ordered Quantity</span>
                <strong style={{ display: 'block', color: '#0f172a' }}>{order.quantity} quintals</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Agreed Rate</span>
                <strong style={{ display: 'block', color: '#15803d' }}>₹{unitPrice.toLocaleString('en-IN')} / qtl</strong>
              </div>
            </div>
          </div>

          {/* Payment & Escrow Guarantee */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="#15803d" />
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#166534', margin: 0 }}>
                Escrow Guarantee Protected
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#15803d', lineHeight: 1.5, marginBottom: '16px' }}>
              Your payment of <strong>₹{grossAmount.toLocaleString('en-IN')}</strong> is safely held in PikMoolya Escrow. Funds are released to the farmer only after destination weight & visual quality sign-off.
            </p>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #bbf7d0', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Digital Escrow (NEFT/RTGS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Settlement Condition:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Mandi Weighbridge Slip</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Dispute Window:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>24 Hours Post-Arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Contact Information */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Registered Farmer Lot
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Farm ID: #{order.farmerId ? order.farmerId.slice(0, 8) : 'FARM-LOT-01'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/marketplace" className="btn-secondary" style={{ fontSize: '13px' }}>
              Procure More Lots
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
