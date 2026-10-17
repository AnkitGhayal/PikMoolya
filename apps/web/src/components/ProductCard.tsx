import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award, TrendingUp } from 'lucide-react';

export interface Product {
  id: string;
  cropName: string;
  category?: string;
  quantity: number;
  unit: string;
  location: string;
  expectedPrice: number;
  predictedFairPrice?: number;
  qualityScore?: number;
  qualityCategory?: string;
  imageUrl?: string;
  description?: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="product-card">
      <img
        src={product.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600'}
        alt={product.cropName}
        className="product-img"
      />
      <div className="product-body">
        <div className="flex-between" style={{ marginBottom: '6px' }}>
          <span className="badge badge-info">{product.category || 'Agricultural Crop'}</span>
          <span className="badge badge-success">Score: {product.qualityScore || 85}/100</span>
        </div>

        <h3 className="product-title">{product.cropName}</h3>
        <p className="product-seller" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} color="#718096" /> {product.location || 'Pune district'}
        </p>

        <div className="price-row" style={{ marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#718096', display: 'block' }}>Expected Price</span>
            <span className="seller-price">₹{product.expectedPrice.toLocaleString('en-IN')} /{product.unit}</span>
          </div>

          {product.predictedFairPrice ? (
            <div style={{ textAlign: 'right' }}>
              <span className="fair-price-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> AI Fair: ₹{product.predictedFairPrice.toLocaleString('en-IN')}
              </span>
            </div>
          ) : null}
        </div>

        <div style={{ fontSize: '12px', color: '#4A5568', margin: '8px 0' }}>
          Available: <strong>{product.quantity} {product.unit}</strong>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <Link to={`/product/${product.id}`} className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '8px' }}>
            View Details
          </Link>
          <Link to={`/product/${product.id}`} className="btn-primary" style={{ flex: 1, fontSize: '13px', padding: '8px' }}>
            Order
          </Link>
        </div>
      </div>
    </div>
  );
};
