import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Lock, Phone, Eye, EyeOff, Building2, UserCheck, ArrowRight, Truck, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState<string>('+919876543210');
  const [password, setPassword] = useState<string>('Farmer@12345');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleQuickFill = (role: 'farmer' | 'buyer' | 'logistics' | 'admin') => {
    if (role === 'farmer') {
      setPhone('+919876543210');
      setPassword('Farmer@12345');
      showToast('Loaded Farmer demo credentials (Ramesh Patil)', 'info');
    } else if (role === 'buyer') {
      setPhone('+919876543211');
      setPassword('Buyer@12345');
      showToast('Loaded Buyer demo credentials (MahaAgro Traders)', 'info');
    } else if (role === 'logistics') {
      setPhone('+919876543212');
      setPassword('Logistics@12345');
      showToast('Loaded Logistics Partner demo credentials', 'info');
    } else if (role === 'admin') {
      setPhone('+919876543213');
      setPassword('Admin@12345');
      showToast('Loaded Admin demo credentials', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(phone, password);
      showToast('Welcome back to PikMoolya!', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 16px', maxWidth: '460px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '36px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
        {/* Brand Icon & Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div 
            style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '14px', 
              backgroundColor: '#dcfce7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <Sprout size={30} color="#15803d" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            {t('signInTitle')}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {t('signInSubtitle')}
          </p>
        </div>

        {/* 1-Click Quick Demo Login Preset */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', textAlign: 'center' }}>
            {t('appName')} • 1-Click Demo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('farmer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                fontSize: '11px',
                fontWeight: 700,
                color: '#15803d',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sprout size={13} /> {t('roleFarmer')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('buyer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Building2 size={13} /> {t('roleBuyer')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('logistics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #fde68a',
                fontSize: '11px',
                fontWeight: 700,
                color: '#d97706',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Truck size={13} /> Logistics
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd6fe',
                fontSize: '11px',
                fontWeight: 700,
                color: '#7c3aed',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          </div>
        </div>

        {error ? (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>{t('phoneNumber')}</label>
            <div style={{ position: 'relative' }}>
              <Phone size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '14px' }}
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#334155', margin: 0 }}>{t('password')}</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '14px' }}
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? t('signingIn') : (
              <>{t('signInBtn')} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
          {t('dontHaveAccount')}{' '}
          <Link to="/register" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
            {t('navRegister')}
          </Link>
        </div>
      </div>
    </div>
  );
};
