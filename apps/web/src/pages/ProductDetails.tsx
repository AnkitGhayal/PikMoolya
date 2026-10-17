import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Product } from '../components/ProductCard';
import { PricePredictionCard } from '../components/PricePredictionCard';
import { QualityScoreCard } from '../components/QualityScoreCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, ShoppingCart, ArrowLeft } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderQty, setOrderQty] = useState<string>('10');
  const [orderLoading, setOrderLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then((res) => {
          setProduct(res.data.data);
        })
        .catch((err) => {
          console.log('Error loading product details:', err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setOrderLoading(true);
      await api.post('/orders', {
        productId: product?.id,
        quantity: Number(orderQty),
        price: product?.expectedPrice,
      });
      alert('Order placed successfully!');
      navigate('/buyer/orders');
    } catch (err: any) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading product details..." />;
  if (!product) return <div className="container" style={{ padding: '48px' }}>Product not found.</div>;

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: '1000px' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600'}
            alt={product.cropName}
            style={{ width: '100%', borderRadius: '8px', border: '1px solid #E2E8F0', maxHeight: '380px', objectFit: 'cover' }}
          />

          <div style={{ marginTop: '20px' }}>
            <QualityScoreCard
              score={product.qualityScore || 85}
              category={product.qualityCategory || 'Grade A'}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <span className="badge badge-info">{product.category || 'Crop'}</span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A202C', marginTop: '8px' }}>{product.cropName}</h1>
            <p style={{ fontSize: '14px', color: '#718096', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <MapPin size={16} color="#718096" /> {product.location}
            </p>

            {/* Price Visual Comparison */}
            <div className="comparison-box">
              <div className="comparison-item">
                <span className="comparison-label">Seller Listing Price</span>
                <div className="comparison-value" style={{ color: '#1B5E20' }}>
                  ₹{product.expectedPrice.toLocaleString('en-IN')} <span style={{ fontSize: '12px' }}>/{product.unit}</span>
                </div>
              </div>

              <div className="comparison-item" style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
                <span className="comparison-label">AI Estimated Fair Price</span>
                <div className="comparison-value" style={{ color: '#2B6CB0' }}>
                  ₹{product.predictedFairPrice?.toLocaleString('en-IN')} <span style={{ fontSize: '12px' }}>/{product.unit}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#2D3748', margin: '16px 0', lineHeight: 1.6 }}>
              {product.description}
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
              <label className="form-label">Order Quantity ({product.unit})</label>
              <input
                type="number"
                className="form-input"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                min="1"
                max={product.quantity}
              />
              <span style={{ fontSize: '12px', color: '#718096', marginTop: '4px', display: 'block' }}>
                Available in stock: {product.quantity} {product.unit}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            >
              <ShoppingCart size={18} /> Place Order Now
            </button>
          </div>

          {product.predictedFairPrice ? (
            <PricePredictionCard
              cropName={product.cropName}
              predictedPrice={product.predictedFairPrice}
              historicalPrice={Math.round(product.expectedPrice * 0.95)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
