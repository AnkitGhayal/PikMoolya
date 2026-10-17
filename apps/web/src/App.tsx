import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Marketplace } from './pages/Marketplace';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { FarmerProducts } from './pages/farmer/FarmerProducts';
import { AddProduct } from './pages/farmer/AddProduct';
import { EditProduct } from './pages/farmer/EditProduct';
import { PricePrediction } from './pages/farmer/PricePrediction';
import { QualityAssessment } from './pages/farmer/QualityAssessment';
import { FarmerOrders } from './pages/farmer/FarmerOrders';

import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerProfile } from './pages/buyer/BuyerProfile';
import { BuyerOrders } from './pages/buyer/BuyerOrders';
import { BuyerOrderDetail } from './pages/buyer/BuyerOrderDetail';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Farmer Routes */}
              <Route
                path="/farmer/*"
                element={
                  <ProtectedRoute allowedRoles={['FARMER']}>
                    <div className="dashboard-layout">
                      <Sidebar />
                      <Routes>
                        <Route path="dashboard" element={<FarmerDashboard />} />
                        <Route path="profile" element={<FarmerProfile />} />
                        <Route path="products" element={<FarmerProducts />} />
                        <Route path="products/add" element={<AddProduct />} />
                        <Route path="products/:id/edit" element={<EditProduct />} />
                        <Route path="prediction" element={<PricePrediction />} />
                        <Route path="quality" element={<QualityAssessment />} />
                        <Route path="orders" element={<FarmerOrders />} />
                      </Routes>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Buyer Routes */}
              <Route
                path="/buyer/*"
                element={
                  <ProtectedRoute allowedRoles={['BUYER']}>
                    <div className="dashboard-layout">
                      <Sidebar />
                      <Routes>
                        <Route path="dashboard" element={<BuyerDashboard />} />
                        <Route path="profile" element={<BuyerProfile />} />
                        <Route path="orders" element={<BuyerOrders />} />
                        <Route path="orders/:id" element={<BuyerOrderDetail />} />
                      </Routes>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
