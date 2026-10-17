import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const BuyerProfile: React.FC = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('AgriProcure Trading Co.');
  const [location, setLocation] = useState('Pune APMC Market Yard');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>Business Profile</h1>

      {saved ? (
        <div style={{ backgroundColor: '#C6F6D5', color: '#22543D', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          Buyer business profile updated successfully!
        </div>
      ) : null}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Business / Firm Name</label>
            <input type="text" className="form-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" value={user?.phone || '+919876543210'} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Business Location / APMC License Address</label>
            <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};
