import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const FarmerProfile: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('Ramesh Patil');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [village, setVillage] = useState('Haveli');
  const [farmSize, setFarmSize] = useState('5.5');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20', marginBottom: '16px' }}>Farmer Profile</h1>

      {saved ? (
        <div style={{ backgroundColor: '#C6F6D5', color: '#22543D', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
          Farmer profile updated successfully!
        </div>
      ) : null}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" value={user?.phone || '+919876543210'} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">District</label>
            <input type="text" className="form-input" value={district} onChange={(e) => setDistrict(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Village / Tehsil</label>
            <input type="text" className="form-input" value={village} onChange={(e) => setVillage(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Farm Size (Acres)</label>
            <input type="number" step="0.1" className="form-input" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};
