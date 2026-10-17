import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Phone } from 'lucide-react';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState<string>('+919876543210');
  const [password, setPassword] = useState<string>('Farmer@12345');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(phone, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '64px 20px', maxWidth: '450px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Sprout size={36} color="#1B5E20" />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginTop: '8px' }}>Sign In to PikMoolya</h2>
          <p style={{ fontSize: '13px', color: '#718096' }}>Fair Price Discovery Platform</p>
        </div>

        {error ? (
          <div style={{ backgroundColor: '#FFF5F5', color: '#E53E3E', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#A0AEC0" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#A0AEC0" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#718096' }}>
          Don't have an account? <Link to="/register" style={{ color: '#1B5E20', fontWeight: 600 }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};
