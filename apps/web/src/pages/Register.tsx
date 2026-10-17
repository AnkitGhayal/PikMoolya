import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export const Register: React.FC = () => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [fullName, setFullName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Pune');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register({
        phone,
        password,
        role,
        fullName: fullName || 'User',
        district: district || 'Pune',
      });
      await login(phone, password);
      navigate(role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '48px 20px', maxWidth: '500px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Sprout size={36} color="#1B5E20" />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginTop: '8px' }}>Create PikMoolya Account</h2>
          <p style={{ fontSize: '13px', color: '#718096' }}>Register as a Farmer or Buyer</p>
        </div>

        {error ? (
          <div style={{ backgroundColor: '#FFF5F5', color: '#E53E3E', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className={role === 'FARMER' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1 }}
                onClick={() => setRole('FARMER')}
              >
                Farmer
              </button>
              <button
                type="button"
                className={role === 'BUYER' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1 }}
                onClick={() => setRole('BUYER')}
              >
                Buyer / Trader
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name / Business Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Patil"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +919876543210"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">District / Location</label>
            <input
              type="text"
              className="form-input"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Pune, Nashik"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create secure password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#718096' }}>
          Already registered? <Link to="/login" style={{ color: '#1B5E20', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
