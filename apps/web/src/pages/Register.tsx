import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Building2, User, Phone, MapPin, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('FARMER');
  const [fullName, setFullName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Pune');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { register, login } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !fullName) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        phone,
        password,
        role,
        fullName: fullName || (role === 'FARMER' ? 'Farmer User' : 'Buyer User'),
        district: district || 'Pune',
      });
      await login(phone, password);
      showToast(`Welcome to PikMoolya! Account created as ${role}.`, 'success');
      navigate(role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '48px 16px', maxWidth: '520px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '36px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            {t('signUpTitle')}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {t('signUpSubtitle')}
          </p>
        </div>

        {error ? (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          {/* Segmented Role Selector */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
              {t('accountType')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                onClick={() => setRole('FARMER')}
                style={{
                  border: role === 'FARMER' ? '2px solid #15803d' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  backgroundColor: role === 'FARMER' ? '#f0fdf4' : '#ffffff',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: role === 'FARMER' ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: role === 'FARMER' ? '#15803d' : '#64748b' }}>
                  <Sprout size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: role === 'FARMER' ? '#15803d' : '#0f172a' }}>
                  {t('roleFarmer')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {t('farmerRoleDesc')}
                </div>
              </div>

              <div
                onClick={() => setRole('BUYER')}
                style={{
                  border: role === 'BUYER' ? '2px solid #15803d' : '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  backgroundColor: role === 'BUYER' ? '#f0fdf4' : '#ffffff',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: role === 'BUYER' ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', color: role === 'BUYER' ? '#15803d' : '#64748b' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: role === 'BUYER' ? '#15803d' : '#0f172a' }}>
                  {t('roleBuyer')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {t('buyerRoleDesc')}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
              {t('fullName')}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '14px' }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === 'FARMER' ? 'e.g. Ramesh Patil' : 'e.g. MahaAgro Traders Pvt Ltd'}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>{t('phoneNumber')}</label>
            <div style={{ position: 'relative' }}>
              <Phone size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '14px' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>District / Market Yard Region</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '14px' }}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Pune, Nashik, Kolhapur"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '14px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0', fontSize: '12px', color: '#64748b' }}>
            <ShieldCheck size={16} color="#15803d" />
            <span>APMC compliance & Escrow protection enabled</span>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? t('creatingAccount') : (
              <>{t('signUpBtn')} <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
            {t('navSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};
