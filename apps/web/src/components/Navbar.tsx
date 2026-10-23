import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, LogOut, LayoutDashboard, ShoppingBag, Menu, X, ArrowRight, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { info } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    info('Signed Out', 'You have been safely signed out of your account.');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
        <div className="navbar-brand-icon">
          <Sprout size={24} strokeWidth={2.5} />
        </div>
        <div className="navbar-brand-text">
          <span className="navbar-brand-title">{t('appName')}</span>
          <span className="navbar-brand-sub">{language === 'mr' ? 'योग्य भाव शोध' : 'Fair Price Discovery'}</span>
        </div>
      </Link>

      {/* Desktop Links */}
      <nav className="navbar-links" style={{ display: 'flex', alignItems: 'center' }}>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          {t('navHome')}
        </NavLink>
        <NavLink to="/marketplace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {t('navMarketplace')}
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {t('navAbout')}
        </NavLink>

        {/* Language Switcher Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '9999px',
            border: '1px solid var(--border-default)',
            padding: '2px',
            marginLeft: '6px',
            marginRight: '6px',
          }}
          title={t('selectLanguage')}
        >
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: language === 'en' ? 'var(--primary)' : 'transparent',
              color: language === 'en' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('mr')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: language === 'mr' ? 'var(--primary)' : 'transparent',
              color: language === 'mr' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            मराठी
          </button>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '4px' }}>
            {user.role === 'FARMER' ? (
              <NavLink to="/farmer/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> {t('navFarmerPortal')}
              </NavLink>
            ) : (
              <NavLink to="/buyer/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ShoppingBag size={16} /> {t('navBuyerPortal')}
              </NavLink>
            )}

            <div className="navbar-user-chip">
              <div className="navbar-avatar">
                {user.role === 'FARMER' ? 'F' : 'B'}
              </div>
              <span className={`role-tag ${user.role === 'FARMER' ? 'role-tag-farmer' : 'role-tag-buyer'}`}>
                {user.role === 'FARMER' ? t('roleFarmer') : t('roleBuyer')}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="btn-secondary btn-sm"
              title="Sign out of account"
              aria-label="Sign out"
            >
              <LogOut size={15} />
              <span>{t('navSignOut')}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
            <Link to="/login" className="btn-secondary btn-sm">
              {t('navSignIn')}
            </Link>
            <Link to="/register" className="btn-primary btn-sm">
              {t('navRegister')} <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        className="navbar-mobile-toggle btn-secondary btn-icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{t('selectLanguage')}</span>
            <div style={{ display: 'inline-flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`btn-sm ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`btn-sm ${language === 'mr' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                मराठी
              </button>
            </div>
          </div>

          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('navHome')}
          </NavLink>
          <NavLink to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('navMarketplace')}
          </NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('navAbout')}
          </NavLink>

          {user ? (
            <>
              {user.role === 'FARMER' ? (
                <NavLink to="/farmer/dashboard" onClick={() => setMobileMenuOpen(false)} className="nav-link">
                  {t('navFarmerPortal')}
                </NavLink>
              ) : (
                <NavLink to="/buyer/dashboard" onClick={() => setMobileMenuOpen(false)} className="nav-link">
                  {t('navBuyerPortal')}
                </NavLink>
              )}
              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`role-tag ${user.role === 'FARMER' ? 'role-tag-farmer' : 'role-tag-buyer'}`}>
                  {user.role === 'FARMER' ? t('roleFarmer') : t('roleBuyer')}
                </span>
                <button onClick={handleSignOut} className="btn-danger btn-sm">
                  <LogOut size={14} /> {t('navSignOut')}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                {t('navSignIn')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ flex: 1 }}>
                {t('navRegister')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
