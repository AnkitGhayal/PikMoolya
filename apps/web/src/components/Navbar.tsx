import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <Sprout size={28} color="#1B5E20" />
        <span>PikMoolya</span>
      </Link>

      <nav className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/marketplace" className="nav-link">Marketplace</Link>

        {user ? (
          <>
            {user.role === 'FARMER' ? (
              <Link to="/farmer/dashboard" className="nav-link">Farmer Portal</Link>
            ) : (
              <Link to="/buyer/dashboard" className="nav-link">Buyer Portal</Link>
            )}
            <span className="role-tag">{user.role}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: '6px 16px' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '6px 16px' }}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
