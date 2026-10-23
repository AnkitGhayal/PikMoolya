import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  FileCheck, 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  CreditCard,
  Save,
  CheckCircle2
} from 'lucide-react';

export const BuyerProfile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [businessName, setBusinessName] = useState('AgriProcure Agro Trading Co.');
  const [licenseNo, setLicenseNo] = useState('MH-PUN-APMC-2024-8842');
  const [gstin, setGstin] = useState('27AABCP8842L1Z8');
  const [location, setLocation] = useState('Pune APMC Market Yard, Gultekdi');
  const [dispatchAddress, setDispatchAddress] = useState('Warehouse 14B, Central Mandi Logistics Corridor, Hadapsar, Pune - 411028');
  const [settlementMode, setSettlementMode] = useState('ESCROW_DIRECT');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      showToast('Business trading profile updated successfully!', 'success');
    }, 600);
  };

  return (
    <div className="page-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div 
            style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '16px', 
              backgroundColor: '#15803d', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
            }}
          >
            {businessName.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {businessName}
              </h1>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> APMC Certified Trader
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Registered Institutional Buyer • License #{licenseNo}
            </p>
          </div>
        </div>

        {/* Quick Procurement Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Volume Procured</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              480 Quintals
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Completed Trades</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
              18 Shipments
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Settlement Rating</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
              99.6% (Fast Release)
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#15803d" /> Trading Entity Credentials
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Trade / Firm Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registered Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '36px', backgroundColor: '#f8fafc', color: '#64748b' }} 
                  value={user?.phone || '+919876543210'} 
                  disabled 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">APMC Trading License No.</label>
              <div style={{ position: 'relative' }}>
                <FileCheck size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '36px' }}
                  value={licenseNo} 
                  onChange={(e) => setLicenseNo(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN / Tax ID</label>
              <input 
                type="text" 
                className="form-input" 
                value={gstin} 
                onChange={(e) => setGstin(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '4px' }}>
            <label className="form-label">Primary Mandi Market / Operating Yard</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '36px' }}
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Default Consignment Warehouse Address</label>
            <textarea 
              className="form-input" 
              rows={2}
              value={dispatchAddress} 
              onChange={(e) => setDispatchAddress(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Settlement Mode Guarantee</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div 
                onClick={() => setSettlementMode('ESCROW_DIRECT')}
                style={{
                  border: settlementMode === 'ESCROW_DIRECT' ? '2px solid #15803d' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: settlementMode === 'ESCROW_DIRECT' ? '#f0fdf4' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <CreditCard size={18} color="#15803d" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>PikMoolya Escrow</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Instant release on QA pass</div>
                </div>
              </div>

              <div 
                onClick={() => setSettlementMode('BANK_RTGS')}
                style={{
                  border: settlementMode === 'BANK_RTGS' ? '2px solid #15803d' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  backgroundColor: settlementMode === 'BANK_RTGS' ? '#f0fdf4' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <ShieldCheck size={18} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Direct Mandi RTGS</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Bank transfer against slip</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={isSaving}
              className="btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
            >
              {isSaving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save size={16} /> Save Trading Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
