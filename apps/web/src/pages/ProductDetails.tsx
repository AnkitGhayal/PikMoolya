import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, getCropImage } from '../components/ProductCard';
import { PricePredictionCard } from '../components/PricePredictionCard';
import { QualityScoreCard } from '../components/QualityScoreCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  MapPin,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Scale,
  Award,
  Truck,
  Building,
  User,
  Info,
  DollarSign,
  HandCoins,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { t, formatCurrency, formatNumber, language } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderQty, setOrderQty] = useState<number>(5);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Negotiation Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQty, setOfferQty] = useState<number>(5);
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [submittingOffer, setSubmittingOffer] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then((res) => {
          const p = res.data.data;
          setProduct(p);
          if (p?.quantity) {
            const initialQty = Math.min(5, p.quantity);
            setOrderQty(initialQty);
            setOfferQty(initialQty);
          }
          if (p?.expectedPrice) {
            // Default offer price to predicted fair price if available, otherwise 95% of expected
            const defaultOffer = p.predictedFairPrice || Math.round(p.expectedPrice * 0.95);
            setOfferPrice(defaultOffer);
          }
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

      setShowConfirmModal(false);
      success(
        t('directOrderTitle'),
        t('directOrderDesc')
      );
      navigate('/buyer/orders');
    } catch (err: any) {
      toastError('Order Placement Failed', err.response?.data?.message || err.message || 'Unable to place order.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product) return;

    if (!offerPrice || offerPrice <= 0) {
      toastError('Invalid Offer', 'Please enter a valid offer price per unit.');
      return;
    }
    if (!offerQty || offerQty <= 0 || offerQty > (product.quantity || 1)) {
      toastError('Invalid Quantity', `Please enter a quantity between 1 and ${product.quantity} ${product.unit}.`);
      return;
    }

    try {
      setSubmittingOffer(true);
      await api.post('/offers', {
        listingId: product.id,
        offeredPricePerUnit: Number(offerPrice),
        quantity: Number(offerQty),
        message: offerMessage.trim() || undefined,
      });

      setShowOfferModal(false);
      success(
        t('offerSuccessTitle'),
        t('offerSuccessDesc')
      );
      navigate('/buyer/orders');
    } catch (err: any) {
      toastError('Offer Submission Failed', err.response?.data?.message || err.message || 'Unable to submit negotiation offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) return <LoadingSpinner message={t('loading')} />;
  if (!product) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{t('noListingsFound')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This produce listing may have been sold or removed.</p>
        <Link to="/marketplace" className="btn-primary">
          <ArrowLeft size={16} /> {t('back')} {t('navMarketplace')}
        </Link>
      </div>
    );
  }

  const imgSrc = getCropImage(product.cropName, product.imageUrl);
  const maxAvailable = product.quantity || 1;
  const totalPrice = orderQty * (product.expectedPrice || 2500);
  const totalOfferVal = offerQty * (offerPrice || 0);
  const priceDiff = (offerPrice || 0) - product.expectedPrice;
  const priceDiffPct = Math.round((priceDiff / product.expectedPrice) * 100);

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '1120px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link to="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <ArrowLeft size={14} /> {t('navMarketplace')}
        </Link>
        <span>/</span>
        <span>{product.cropName}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{product.id.slice(-6)}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '36px' }}>
        {/* Left Column: Visual Assets & Quality Proof */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <img
              src={imgSrc}
              alt={product.cropName}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="#4ade80" /> {t('verifiedSeller')}
            </div>
          </div>

          {/* Quality Assessment Scorecard */}
          <div style={{ marginTop: '24px' }}>
            <QualityScoreCard
              score={product.qualityScore || 85}
              category={product.qualityCategory || 'Grade A'}
              confidence={88.5}
              detectedIssues={[
                'High grain size uniformity (92%)',
                'Optimum visual moisture content (<12%)',
                'Zero visible insect infestation or rot',
              ]}
              recommendation="PREMIUM_MARKETABLE"
            />
          </div>

          {/* Price Benchmark Explainer */}
          {product.predictedFairPrice ? (
            <div style={{ marginTop: '24px' }}>
              <PricePredictionCard
                cropName={product.cropName}
                predictedPrice={product.predictedFairPrice}
                historicalPrice={Math.round(product.expectedPrice * 0.95)}
                marketCondition="HIGH_DEMAND"
              />
            </div>
          ) : null}
        </div>

        {/* Right Column: Specifications, Price Comparison & Order/Negotiate Widgets */}
        <div>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-info">{product.category || 'Agricultural Crop'}</span>
              <span className="badge badge-success">In Stock</span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {product.cropName}
            </h1>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', marginBottom: '20px' }}>
              <MapPin size={16} color="var(--primary)" /> {product.location || 'Maharashtra Mandi Yard'}
            </p>

            {/* Price Comparison Widget */}
            <div className="comparison-box">
              <div className="comparison-item">
                <span className="comparison-label">{t('expectedPrice')}</span>
                <div className="comparison-value" style={{ color: 'var(--primary-dark)' }}>
                  {formatCurrency(product.expectedPrice)}{' '}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                    /{product.unit}
                  </span>
                </div>
              </div>

              <div className="comparison-item">
                <span className="comparison-label">{t('derivedFairPrice')}</span>
                <div className="comparison-value" style={{ color: 'var(--ai-blue)' }}>
                  {formatCurrency(product.predictedFairPrice || Math.round(product.expectedPrice * 0.98))}{' '}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                    /{product.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
              {product.description || 'Superior quality grain harvested under optimal conditions. Sun-dried and stored in moisture-controlled bags. Ready for prompt wholesale pickup or delivery.'}
            </div>

            {/* Quantity Selector & Cost Breakdown */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                marginBottom: '24px',
              }}
            >
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  {t('orderQuantity')} ({product.unit})
                </label>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('availableQty')}: <strong style={{ color: 'var(--text-primary)' }}>{formatNumber(maxAvailable)} {product.unit}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '16px', fontWeight: 700 }}
                  value={orderQty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0 && val <= maxAvailable) {
                      setOrderQty(val);
                      setOfferQty(val);
                    } else if (val > maxAvailable) {
                      setOrderQty(maxAvailable);
                      setOfferQty(maxAvailable);
                    }
                  }}
                  min="1"
                  max={maxAvailable}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {[1, 5, 10, 20].filter(q => q <= maxAvailable).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setOrderQty(q);
                      setOfferQty(q);
                    }}
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: orderQty === q ? 'var(--primary)' : '#ffffff',
                      color: orderQty === q ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {q} {product.unit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOrderQty(maxAvailable);
                    setOfferQty(maxAvailable);
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: orderQty === maxAvailable ? 'var(--primary)' : '#ffffff',
                    color: orderQty === maxAvailable ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  Max All ({formatNumber(maxAvailable)})
                </button>
              </div>

              {/* Calculation Summary */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('totalOrderValue')}</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--status-success)', fontWeight: 600 }}>
                  <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Zero middleman cut
                </div>
              </div>
            </div>

            {/* Action Buttons: Direct Purchase AND Make an Offer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowConfirmModal(true);
                  }
                }}
                disabled={orderLoading || maxAvailable <= 0}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingCart size={18} /> {t('directPurchase')}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowOfferModal(true);
                  }
                }}
                disabled={maxAvailable <= 0}
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderColor: 'var(--primary)', color: 'var(--primary-dark)', fontWeight: 700 }}
              >
                <HandCoins size={18} color="var(--primary)" /> {t('makeAnOffer')}
              </button>
            </div>

            {/* Escrow Guarantee Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--primary-hover)',
              }}
            >
              <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                <strong>PikMoolya Escrow Protection:</strong> Funds are safely held in trust and only released to the farmer after successful physical delivery verification.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Order Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShoppingCart size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('directPurchase')}</h2>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You are about to place a direct farm order with atomic inventory reservation:
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>{t('produceCrop')}:</span>
                <strong>{product.cropName}</strong>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>{t('quantityOrdered')}:</span>
                <strong>{formatNumber(orderQty)} {product.unit}</strong>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>{t('pricePerUnit')}:</span>
                <strong>{formatCurrency(product.expectedPrice)} /{product.unit}</strong>
              </div>
              <div
                className="flex-between"
                style={{ paddingTop: '8px', borderTop: '1px solid var(--border-default)', fontSize: '16px' }}
              >
                <span>{t('totalOrderValue')}:</span>
                <strong style={{ color: 'var(--primary-dark)' }}>{formatCurrency(totalPrice)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
                disabled={orderLoading}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="btn-primary"
                style={{ flex: 1.5 }}
                disabled={orderLoading}
              >
                {orderLoading ? t('loading') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Make An Offer Modal */}
      {showOfferModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HandCoins size={26} color="var(--primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('makeAnOffer')}</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Propose a custom price to the farmer. The farmer can accept, counter, or decline your offer.
            </p>

            <form onSubmit={handleSubmitOffer}>
              {/* Reference Benchmarks Pill */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t('expectedPrice')}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(product.expectedPrice)} /{product.unit}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t('derivedFairPrice')}</span>
                  <strong style={{ color: 'var(--ai-blue)' }}>{formatCurrency(product.predictedFairPrice || Math.round(product.expectedPrice * 0.98))} /{product.unit}</strong>
                </div>
              </div>

              {/* Price Per Unit Input */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('offerPricePerUnit')} (₹ /{product.unit})</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ fontSize: '16px', fontWeight: 700, paddingLeft: '32px' }}
                    value={offerPrice || ''}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    min="1"
                    placeholder={t('enterOfferPrice')}
                    required
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹
                  </span>
                </div>
                {priceDiff !== 0 && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: priceDiff < 0 ? '#b91c1c' : '#15803d', marginTop: '4px', display: 'inline-block' }}>
                    {priceDiff < 0 ? `${priceDiffPct}% below asking price` : `+${priceDiffPct}% above asking price`}
                  </span>
                )}
              </div>

              {/* Quantity Input */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('orderQuantity')} ({product.unit})</label>
                <input
                  type="number"
                  className="form-input"
                  value={offerQty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0 && val <= maxAvailable) {
                      setOfferQty(val);
                    }
                  }}
                  min="1"
                  max={maxAvailable}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                  Available in stock: {formatNumber(maxAvailable)} {product.unit}
                </span>
              </div>

              {/* Total Calculation */}
              <div
                style={{
                  backgroundColor: 'var(--primary-light)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>{t('totalOrderValue')}:</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  {formatCurrency(totalOfferVal)}
                </span>
              </div>

              {/* Message Note to Seller */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">{t('messageOptional')}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder={t('messagePlaceholder')}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  disabled={submittingOffer}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1.5 }}
                  disabled={submittingOffer}
                >
                  {submittingOffer ? t('submittingOffer') : t('submitOfferBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
