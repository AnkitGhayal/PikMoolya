import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Package,
  TrendingUp,
  Award,
  ShoppingCart,
  PlusCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Scale,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/farmer-dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.log('Error loading farmer dashboard:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message={t('loading')} />;

  const listings = data?.produce?.activeListings || data?.produce?.listings || [];

  return (
    <div className="page-container animate-fade-in">
      {/* Top Header */}
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('roleFarmer')}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {t('farmerDashboardTitle')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {t('farmerDashboardSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/farmer/prediction" className="btn-secondary">
            <TrendingUp size={16} color="var(--primary)" /> {t('sidebarPriceDiscovery')}
          </Link>
          <Link to="/farmer/products/add" className="btn-primary">
            <PlusCircle size={16} /> {t('addNewListing')}
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div>
            <div className="stat-label">{t('activeProductsCard')}</div>
            <div className="stat-value">{listings.length}</div>
            <div className="stat-trend stat-trend-up">
              <CheckCircle2 size={13} /> {t('activeListings')}
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <Package size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">AI Quality Proofs</div>
            <div className="stat-value">{listings.length}</div>
            <div className="stat-trend" style={{ color: 'var(--ai-blue)' }}>
              <Award size={13} /> MobileNetV3 Graded
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Award size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">1</div>
            <div className="stat-trend" style={{ color: 'var(--accent)' }}>
              <ShoppingCart size={13} /> Awaiting fulfillment
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <ShoppingCart size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">APMC Price Index</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>Live</div>
            <div className="stat-trend stat-trend-up">
              <TrendingUp size={13} /> MSAMB Calibrated
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <Scale size={22} />
          </div>
        </div>
      </div>

      {/* Action Banners */}
      <div className="grid-2 mb-6">
        <Link
          to="/farmer/prediction"
          className="card card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid var(--primary-border)',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '4px' }}>
              AI Fair Price Calculator
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--primary-hover)', lineHeight: 1.5 }}>
              Compute fair value benchmark using the 5-factor equation Pf = f(C, L, Q, M, H) before quoting.
            </p>
          </div>
          <ArrowRight size={20} color="var(--primary)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </Link>

        <Link
          to="/farmer/quality"
          className="card card-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid var(--ai-blue-border)',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              color: 'var(--ai-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}
          >
            <Award size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', marginBottom: '4px' }}>
              Computer Vision Quality Proof
            </h3>
            <p style={{ fontSize: '13px', color: '#1d4ed8', lineHeight: 1.5 }}>
              Upload grain photographs to obtain instant Grade A/B/C certification and marketability analysis.
            </p>
          </div>
          <ArrowRight size={20} color="var(--ai-blue)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </Link>
      </div>

      {/* Recent Produce Listings Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between mb-4">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Recent Produce Inventory
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Produce currently published on the direct agricultural marketplace
            </p>
          </div>
          <Link to="/farmer/products" className="btn-secondary btn-sm">
            View All ({listings.length})
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center" style={{ padding: '48px 16px' }}>
            <Package size={36} color="var(--text-light)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              No active listings yet. Add your first produce to start receiving buyer orders!
            </p>
            <Link to="/farmer/products/add" className="btn-primary">
              <PlusCircle size={16} /> Add First Crop Listing
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop & Variety</th>
                  <th>Quantity Available</th>
                  <th>Expected Price</th>
                  <th>Market Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.slice(0, 5).map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {item.crop?.name?.[0] || 'C'}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {item.crop?.name || 'Produce'}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                            {item.crop?.variety || 'Standard Grade'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {item.remainingQuantity ?? item.quantity} {item.unit || 'quintal'}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-dark)', fontSize: '15px' }}>
                        ₹{(item.expectedPrice || 2450).toLocaleString('en-IN')}
                      </strong>{' '}
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{item.unit || 'quintal'}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} color="var(--text-muted)" /> {item.locationApproximate || 'Pune APMC'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {item.status || 'PUBLISHED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/product/${item.id}`}
                        className="btn-secondary btn-sm"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Marketplace View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
