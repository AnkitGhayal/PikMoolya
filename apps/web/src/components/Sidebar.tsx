import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Package,
  PlusCircle,
  TrendingUp,
  Award,
  ShoppingCart,
  Store,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      {user.role === 'FARMER' ? (
        <>
          <NavLink to="/farmer/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/farmer/products" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Package size={18} /> My Products
          </NavLink>
          <NavLink to="/farmer/products/add" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} /> Add Produce
          </NavLink>
          <NavLink to="/farmer/prediction" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <TrendingUp size={18} /> Price Discovery
          </NavLink>
          <NavLink to="/farmer/quality" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Award size={18} /> Quality Proof
          </NavLink>
          <NavLink to="/farmer/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} /> Orders
          </NavLink>
          <NavLink to="/farmer/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <User size={18} /> Farmer Profile
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/buyer/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Buyer Overview
          </NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Store size={18} /> Browse Marketplace
          </NavLink>
          <NavLink to="/buyer/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} /> My Orders
          </NavLink>
          <NavLink to="/buyer/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <User size={18} /> Business Profile
          </NavLink>
        </>
      )}
    </aside>
  );
};
