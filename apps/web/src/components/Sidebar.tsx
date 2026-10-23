import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  User,
  Package,
  PlusCircle,
  TrendingUp,
  Award,
  ShoppingCart,
  Store,
  BadgeCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <aside className="sidebar">
      {user.role === 'FARMER' ? (
        <>
          <div className="sidebar-section-title">{t('sidebarOverview')}</div>
          <NavLink to="/farmer/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} />
            <span>{t('sidebarDashboard')}</span>
          </NavLink>

          <div className="sidebar-section-title">{t('sidebarProduceOrders')}</div>
          <NavLink to="/farmer/products" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            <span>{t('sidebarMyProduce')}</span>
          </NavLink>
          <NavLink to="/farmer/products/add" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} />
            <span>{t('sidebarAddProduce')}</span>
          </NavLink>
          <NavLink to="/farmer/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>{t('sidebarReceivedOrders')}</span>
          </NavLink>

          <div className="sidebar-section-title">{t('sidebarAiEngines')}</div>
          <NavLink to="/farmer/prediction" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <TrendingUp size={18} />
            <span>{t('sidebarPriceDiscovery')}</span>
          </NavLink>
          <NavLink to="/farmer/quality" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Award size={18} />
            <span>{t('sidebarQualityProof')}</span>
          </NavLink>

          <div className="sidebar-section-title">{t('sidebarAccount')}</div>
          <NavLink to="/farmer/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <User size={18} />
            <span>{t('sidebarFarmerProfile')}</span>
          </NavLink>
        </>
      ) : (
        <>
          <div className="sidebar-section-title">{t('sidebarBuyerCenter')}</div>
          <NavLink to="/buyer/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} />
            <span>{t('sidebarDashboard')}</span>
          </NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Store size={18} />
            <span>{t('sidebarBrowseMarketplace')}</span>
          </NavLink>
          <NavLink to="/buyer/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>{t('sidebarMyOrders')}</span>
          </NavLink>

          <div className="sidebar-section-title">{t('sidebarBusinessSettings')}</div>
          <NavLink to="/buyer/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <User size={18} />
            <span>{t('sidebarTradingProfile')}</span>
          </NavLink>
        </>
      )}

      {/* Trust & APMC Compliance Footer in Sidebar */}
      <div
        style={{
          marginTop: 'auto',
          padding: '16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <BadgeCheck size={16} color="var(--primary)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)' }}>
            {t('sidebarApmcVerified')}
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {t('sidebarApmcDesc')}
        </p>
      </div>
    </aside>
  );
};
