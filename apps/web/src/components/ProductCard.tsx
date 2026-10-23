import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

export const getCropImage = (cropName: string = '', fallbackUrl?: string) => {
  const name = cropName.toLowerCase();
  
  if (name.includes('wheat') || name.includes('gehun')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('rice') || name.includes('chawal') || name.includes('paddy') || name.includes('basmati')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('jowar') || name.includes('sorghum')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('bajra') || name.includes('millet')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('onion') || name.includes('pyaz')) {
    return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('soybean') || name.includes('soya')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Soybeans.jpg';
  }
  if (name.includes('cotton') || name.includes('kapas')) {
    return 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('gram') || name.includes('chana') || name.includes('chickpea')) {
    return 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('corn') || name.includes('maize') || name.includes('makka')) {
    return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('sugarcane') || name.includes('ganna')) {
    return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('potato') || name.includes('aloo')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
  }

  // If specific fallback URL provided that is not the generic seed tomato photo
  if (fallbackUrl && fallbackUrl.startsWith('http') && !fallbackUrl.includes('photo-1592924357228')) {
    return fallbackUrl;
  }

  return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const imgSrc = getCropImage(product.cropName, product.imageUrl);
  const grade = product.qualityCategory || 'Grade A';
  const score = product.qualityScore || 85;

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img
          src={imgSrc}
          alt={product.cropName}
          className="product-img"
          loading="lazy"
        />
        <div className="product-category-chip">
          {product.category || (isMr ? 'कृषी शेतमाल' : 'Agricultural Crop')}
        </div>
        <div className="product-grade-badge">
          <Award size={14} color="#15803d" />
          <span style={{ color: '#15803d' }}>{grade}</span>
          <span style={{ color: '#64748b', fontSize: '10px' }}>({Math.round(score)}/100)</span>
        </div>
      </div>

      <div className="product-body">
        <h3 className="product-title">{product.cropName}</h3>
        <p className="product-location">
          <MapPin size={14} color="#64748b" /> {product.location || 'Pune APMC Mandi'}
        </p>

        {/* Price Section */}
        <div className="product-price-section">
          <div className="price-main-row">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>
                {isMr ? 'शेतकऱ्याचा भाव' : 'Seller Ask Price'}
              </span>
              <span className="seller-price">
                ₹{product.expectedPrice.toLocaleString('en-IN')}{' '}
                <span className="seller-price-unit">/{product.unit}</span>
              </span>
            </div>

            {product.predictedFairPrice ? (
              <div style={{ textAlign: 'right' }}>
                <span className="ai-fair-pill">
                  <TrendingUp size={12} /> {isMr ? 'AI रास्त:' : 'AI Fair:'} ₹{product.predictedFairPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Quantity Progress */}
        <div className="product-availability-bar">
          <div className="availability-label">
            <span>{isMr ? 'उपलब्ध साठा' : 'In Stock'}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {product.quantity} {product.unit}
            </span>
          </div>
          <div className="availability-track">
            <div
              className="availability-fill"
              style={{ width: `${Math.min(100, Math.max(15, (product.quantity / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link
            to={`/product/${product.id}`}
            className="btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            {isMr ? 'तपशील' : 'Details'}
          </Link>
          <Link
            to={`/product/${product.id}`}
            className="btn-primary btn-sm"
            style={{ flex: 1.2 }}
          >
            {isMr ? 'मागणी करा' : 'Order Now'} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
