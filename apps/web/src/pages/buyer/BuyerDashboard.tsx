import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getCropImage } from '../../components/ProductCard';
import { Store, ShoppingCart, Award, ShieldCheck, MapPin, ArrowRight, Package } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/buyer-dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.log('Error loading buyer dashboard:', err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message={t('loading')} />;

  const produce = data?.produce || [];

  return (
    <div className="page-container animate-fade-in">
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ai-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('roleBuyer')}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {t('buyerDashboardTitle')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {t('buyerDashboardSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/buyer/orders" className="btn-secondary">
            <ShoppingCart size={16} /> {t('sidebarMyOrders')}
          </Link>
          <Link to="/marketplace" className="btn-primary">
            <Store size={16} /> {t('sidebarBrowseMarketplace')}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div>
            <div className="stat-label">Available Marketplace Lots</div>
            <div className="stat-value">{produce.length}</div>
            <div className="stat-trend stat-trend-up">
              <Package size={13} /> Active farm listings
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <Store size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">AI Quality Assessed</div>
            <div className="stat-value" style={{ color: 'var(--ai-blue)' }}>100%</div>
            <div className="stat-trend" style={{ color: 'var(--ai-blue)' }}>
              <Award size={13} /> Certified Grade A/B
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Award size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Escrow Protected Orders</div>
            <div className="stat-value" style={{ color: 'var(--status-success)' }}>Active</div>
            <div className="stat-trend stat-trend-up">
              <ShieldCheck size={13} /> Zero upfront settlement risk
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Recommended Listings Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="flex-between mb-4">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Featured Farm Harvest Lots
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Direct listings with verified computer vision scores ready for procurement
            </p>
          </div>
          <Link to="/marketplace" className="btn-secondary btn-sm">
            View All Marketplace Listings <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop & Variety</th>
                <th>Quantity</th>
                <th>Price / Unit</th>
                <th>APMC Mandi</th>
                <th>Quality Grade</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produce.slice(0, 5).map((item: any, idx: number) => {
                const cropName = item.crop?.name || 'Crop';
                const img = getCropImage(cropName);
                return (
                  <tr key={item.listingId || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={img}
                          alt={cropName}
                          style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}>{cropName}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                            {item.crop?.variety || 'Standard Quality'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {item.quantity} {item.unit || 'quintal'}
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
                        <MapPin size={13} color="var(--text-muted)" /> {item.location || 'Pune APMC'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        Grade A Certified
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/product/${item.listingId}`}
                        className="btn-primary btn-sm"
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        Procure Lot
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
