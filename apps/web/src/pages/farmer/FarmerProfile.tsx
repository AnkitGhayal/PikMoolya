import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, MapPin, Building, ShieldCheck, CheckCircle2, Save } from 'lucide-react';

export const FarmerProfile: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [fullName, setFullName] = useState('Ramesh Patil');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [village, setVillage] = useState('Haveli');
  const [farmSize, setFarmSize] = useState('5.5');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat & Soybean');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Updated', 'Farmer credentials and land record details saved successfully.');
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '680px' }}>
      <div className="mb-6">
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Identity & Compliance
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
          Farmer Profile & Land Verification
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Manage your verified farmer identity, farm acreage, and APMC market affiliation
        </p>
      </div>

      {/* Profile Header Card */}
      <div
        className="card mb-6"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '1px solid var(--primary-border)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
            boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)',
          }}
        >
          {fullName.charAt(0)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</h2>
            <span className="role-tag role-tag-farmer">Verified Farmer</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {user?.phone || '+919876543210'} • {village}, {district}, {state}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Registered Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={user?.phone || '+919876543210'}
              disabled
            />
            <span className="form-hint">Phone number is verified and tied to your JWT login.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tehsil / Village</label>
              <input
                type="text"
                className="form-input"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">APMC District</label>
              <input
                type="text"
                className="form-input"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cultivated Land (Acres)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Crop Varieties Cultivated</label>
            <input
              type="text"
              className="form-input"
              value={primaryCrop}
              onChange={(e) => setPrimaryCrop(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '12px', fontSize: '15px' }}
          >
            <Save size={16} /> Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
};
