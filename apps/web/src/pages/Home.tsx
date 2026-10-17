import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div style={{ background: '#FFFFFF' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: '#E8F5E9', padding: '64px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#1B5E20' }}>
            <Sprout size={16} /> AI-Powered Agricultural Price Discovery
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#1B5E20', lineHeight: 1.2, marginBottom: '16px' }}>
            Fair Prices for Farmers. Direct Market Access for Buyers.
          </h1>
          <p style={{ fontSize: '18px', color: '#4A5568', marginBottom: '32px' }}>
            PikMoolya empowers farmers with AI price discovery based on $P_f = f(C, L, Q, M, H)$, computer vision crop quality proof, and direct marketplace sales.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/marketplace" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Browse Marketplace <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Register as Farmer / Buyer
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container" style={{ padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1A202C' }}>Platform Capabilities</h2>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '8px' }}>Designed for transparent, disintermediated agricultural trade</p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '24px' }}>
            <TrendingUp size={32} color="#1B5E20" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Fair Price Discovery</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              Calculate estimated benchmark prices considering crop traits, location, historical APMC data, and market demand.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <ShieldCheck size={32} color="#2B6CB0" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Quality Proof & Computer Vision</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              Upload crop photos to generate verifiable quality grades (A/B/C) and feature assessment reports.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <ShoppingCart size={32} color="#DD6B20" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Direct Trade Marketplace</h3>
            <p style={{ fontSize: '14px', color: '#4A5568' }}>
              Connect directly with verified buyers without middleman margins, partial quantity matching, and order tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
