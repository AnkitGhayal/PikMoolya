import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { OrderCard, OrderItem } from '../../components/OrderCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  ShoppingCart,
  Store,
  ArrowRight,
  RefreshCw,
  Truck,
  HandCoins,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface BuyerOfferItem {
  id: string;
  listingId: string;
  buyerId: string;
  quantity: number;
  offeredPricePerUnit: number;
  effectiveNetPerUnit: number;
  deliveryTerms?: string;
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  cropName: string;
  unit: string;
  listingPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export const BuyerOrders: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const { t, formatCurrency, formatNumber, formatDate, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'OFFERS' | 'ORDERS'>('OFFERS');
  const [offers, setOffers] = useState<BuyerOfferItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');

  // Selected Offer & Modals
  const [selectedOffer, setSelectedOffer] = useState<BuyerOfferItem | null>(null);

  // Logistics & Acceptance Modal (Option A vs Option B)
  const [acceptModalOpen, setAcceptModalOpen] = useState<boolean>(false);
  const [logisticsRequired, setLogisticsRequired] = useState<boolean>(true);
  const [logisticsCost, setLogisticsCost] = useState<number>(750);
  const [logisticsPayer, setLogisticsPayer] = useState<'BUYER' | 'FARMER'>('BUYER');
  const [pickupDetails, setPickupDetails] = useState<string>('Farm Gate Pickup, APMC Yard Hub');
  const [deliveryDetails, setDeliveryDetails] = useState<string>('Buyer Central Processing Facility');
  const [accepting, setAccepting] = useState<boolean>(false);

  // Counter Offer Modal
  const [counterModalOpen, setCounterModalOpen] = useState<boolean>(false);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterMessage, setCounterMessage] = useState<string>('');
  const [countering, setCountering] = useState<boolean>(false);

  // Audit History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, ordersRes] = await Promise.all([
        api.get('/offers/my').catch(() => ({ data: { offers: [] } })),
        api.get('/orders').catch(() => ({ data: [] })),
      ]);
      setOffers(offersRes.data?.offers || []);
      setOrders(ordersRes.data || []);
    } catch (err: any) {
      console.log('Error fetching buyer orders/offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Accept Modal with Option A vs Option B choices
  const openAcceptModal = (offer: BuyerOfferItem) => {
    setSelectedOffer(offer);
    const estimatedCost = Math.max(500, Math.min(2500, Math.round(offer.quantity * 25)));
    setLogisticsCost(estimatedCost);
    setLogisticsRequired(true);
    setLogisticsPayer('BUYER');
    setAcceptModalOpen(true);
  };

  // Submit Offer Acceptance with chosen Option A or Option B
  const handleAcceptOffer = async () => {
    if (!selectedOffer) return;
    try {
      setAccepting(true);
      await api.post(`/offers/${selectedOffer.id}/accept`, {
        logisticsRequired,
        logisticsCost: logisticsRequired ? Number(logisticsCost) : 0,
        logisticsPayer: logisticsRequired ? logisticsPayer : undefined,
        pickupDetails: logisticsRequired ? pickupDetails : undefined,
        deliveryDetails: logisticsRequired ? deliveryDetails : undefined,
      });

      setAcceptModalOpen(false);
      success(
        t('offerSuccessTitle'),
        logisticsRequired
          ? 'Counter-offer accepted! Order confirmed with logistics partner assistance.'
          : 'Counter-offer accepted! Order confirmed for direct self-pickup without logistics partner.'
      );
      fetchData();
      setActiveTab('ORDERS');
    } catch (err: any) {
      toastError('Acceptance Failed', err.response?.data?.message || err.message || 'Unable to accept counter offer.');
    } finally {
      setAccepting(false);
    }
  };

  // Open Counter Offer Modal
  const openCounterModal = (offer: BuyerOfferItem) => {
    setSelectedOffer(offer);
    setCounterPrice(offer.offeredPricePerUnit);
    setCounterMessage('');
    setCounterModalOpen(true);
  };

  // Submit Counter Offer
  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    if (!counterPrice || counterPrice <= 0) {
      toastError('Invalid Price', 'Please enter a valid counter price.');
      return;
    }

    try {
      setCountering(true);
      await api.post(`/offers/${selectedOffer.id}/counter`, {
        counterPricePerUnit: Number(counterPrice),
        quantity: selectedOffer.quantity,
        message: counterMessage.trim() || undefined,
      });

      setCounterModalOpen(false);
      success('Counter Sent', `Your counter-proposal of ₹${counterPrice}/${selectedOffer.unit} has been sent to the farmer.`);
      fetchData();
    } catch (err: any) {
      toastError('Counter Failed', err.response?.data?.message || err.message || 'Unable to submit counter offer.');
    } finally {
      setCountering(false);
    }
  };

  // Withdraw Offer
  const handleWithdrawOffer = async (offer: BuyerOfferItem) => {
    if (!window.confirm('Are you sure you want to withdraw this negotiation offer?')) return;
    try {
      await api.post(`/offers/${offer.id}/withdraw`);
      info('Offer Withdrawn', 'Your offer has been safely withdrawn.');
      fetchData();
    } catch (err: any) {
      toastError('Withdrawal Failed', err.response?.data?.message || err.message || 'Unable to withdraw offer.');
    }
  };

  // View Negotiation Timeline
  const openHistoryModal = async (offer: BuyerOfferItem) => {
    setSelectedOffer(offer);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/offers/${offer.id}/history`);
      setHistoryData(res.data);
    } catch (err: any) {
      console.log('Error loading history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const activeOffersCount = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED').length;

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ai-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Procurement Ledger
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {t('sidebarMyOrders')}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Track placed negotiation offers, view farmer counterproposals, and monitor wholesale orders
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchData} className="btn-secondary btn-sm" title={t('refresh')}>
            <RefreshCw size={14} /> {t('refresh')}
          </button>
          <Link to="/marketplace" className="btn-primary btn-sm">
            <Store size={14} /> {t('procureMoreBtn')}
          </Link>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--border-default)',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('OFFERS')}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'OFFERS' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'OFFERS' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <HandCoins size={18} />
          <span>{t('negotiationsTitle')}</span>
          {activeOffersCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--ai-blue)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {activeOffersCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ORDERS')}
          style={{
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'ORDERS' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'ORDERS' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShoppingCart size={18} />
          <span>{t('ordersCenterTitle')}</span>
          <span
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            {orders.length}
          </span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message={t('loading')} />
      ) : activeTab === 'OFFERS' ? (
        <div>
          {/* Offers Filter Pills */}
          <div className="filter-pills" style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setFilter('ALL')}
              className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
            >
              All My Offers ({offers.length})
            </button>
            <button
              onClick={() => setFilter('COUNTERED')}
              className={`filter-pill ${filter === 'COUNTERED' ? 'active' : ''}`}
            >
              Farmer Countered ({offers.filter(o => o.status === 'COUNTERED').length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`filter-pill ${filter === 'PENDING' ? 'active' : ''}`}
            >
              Pending Response ({offers.filter(o => o.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('ACCEPTED')}
              className={`filter-pill ${filter === 'ACCEPTED' ? 'active' : ''}`}
            >
              Accepted ({offers.filter(o => o.status === 'ACCEPTED').length})
            </button>
          </div>

          {filteredOffers.length === 0 ? (
            <div
              className="card text-center"
              style={{
                padding: '64px 24px',
                border: '2px dashed var(--border-default)',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <HandCoins size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {t('noOffersBuyer')}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                {t('marketplaceSubtitle')}
              </p>
              <Link to="/marketplace" className="btn-primary">
                {t('browseMarketplace')} <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOffers.map((offer) => {
                const totalVal = offer.quantity * offer.offeredPricePerUnit;
                const isCountered = offer.status === 'COUNTERED';
                const isPending = offer.status === 'PENDING';

                return (
                  <div
                    key={offer.id}
                    className="card animate-fade-in"
                    style={{
                      padding: '24px',
                      borderLeft: isCountered
                        ? '4px solid var(--ai-blue)'
                        : isPending
                        ? '4px solid var(--accent)'
                        : '4px solid var(--border-default)',
                    }}
                  >
                    <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            className={`badge ${
                              offer.status === 'ACCEPTED'
                                ? 'badge-success'
                                : offer.status === 'COUNTERED'
                                ? 'badge-info'
                                : offer.status === 'PENDING'
                                ? 'badge-warning'
                                : 'badge-neutral'
                            }`}
                          >
                            {offer.status === 'COUNTERED' ? 'FARMER COUNTER-OFFER' : offer.status}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {formatDate(offer.createdAt)}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {offer.cropName}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          Offer Reference #{offer.id.slice(-6)}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                          {t('totalOrderValue')}
                        </span>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                          {formatCurrency(totalVal)}
                        </div>
                      </div>
                    </div>

                    {/* Offer Specification Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                          {t('currentAgreedPrice')}
                        </span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                          {formatCurrency(offer.offeredPricePerUnit)} /{offer.unit}
                        </strong>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                          {t('quantityOrdered')}
                        </span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                          {formatNumber(offer.quantity)} {offer.unit}
                        </strong>
                      </div>

                      {offer.listingPrice ? (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                            {t('originalListingPrice')}
                          </span>
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {formatCurrency(offer.listingPrice)} /{offer.unit}
                          </span>
                        </div>
                      ) : null}

                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                          Logistics Arrangement
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Configurable on Accept
                        </span>
                      </div>
                    </div>

                    {/* Counter Alert Banner */}
                    {isCountered && (
                      <div
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '16px',
                          fontSize: '13px',
                          color: '#1e40af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <AlertCircle size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                        <span>
                          The farmer has counter-proposed <strong>₹{offer.offeredPricePerUnit}/{offer.unit}</strong>. You may accept with your logistics preference, propose another counter, or withdraw.
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                      {isCountered && (
                        <>
                          <button
                            type="button"
                            onClick={() => openAcceptModal(offer)}
                            className="btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <CheckCircle2 size={15} /> {t('acceptOfferBtn')}
                          </button>

                          <button
                            type="button"
                            onClick={() => openCounterModal(offer)}
                            className="btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <HandCoins size={15} color="var(--primary)" /> {t('counterOffer')}
                          </button>
                        </>
                      )}

                      {(isPending || isCountered) && (
                        <button
                          type="button"
                          onClick={() => handleWithdrawOffer(offer)}
                          className="btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', borderColor: '#fca5a5' }}
                        >
                          <XCircle size={15} /> {t('withdrawOfferBtn')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openHistoryModal(offer)}
                        className="btn-secondary btn-sm"
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <History size={14} /> Audit Ledger
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Confirmed Wholesale Orders Tab */
        <div>
          {orders.length === 0 ? (
            <div
              className="card text-center"
              style={{
                padding: '64px 24px',
                border: '2px dashed var(--border-default)',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <ShoppingCart size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No orders placed yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                Browse verified farmer listings on the marketplace with AI quality grades and place your first procurement order.
              </p>
              <Link to="/marketplace" className="btn-primary">
                Browse Marketplace <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid-2">
              {orders.map((order) => (
                <div key={order.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <OrderCard order={order} showActions={false} />
                  <Link
                    to={`/buyer/orders/${order.id}`}
                    className="btn-secondary btn-sm"
                    style={{
                      marginTop: '-10px',
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderTop: 'none',
                      backgroundColor: 'var(--bg-subtle)',
                    }}
                  >
                    <Truck size={14} /> Track Delivery Progress & Logistics Details <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANDATORY LOGISTICS SELECTION MODAL (OPTION A vs OPTION B) */}
      {acceptModalOpen && selectedOffer && (
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
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Truck size={26} color="var(--primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('logisticsDecisionTitle')}</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {t('logisticsDecisionSubtitle')}
            </p>

            {/* Offer Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{selectedOffer.cropName}</strong> — {formatNumber(selectedOffer.quantity)} {selectedOffer.unit}
              </div>
              <div style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '16px' }}>
                {formatCurrency(selectedOffer.quantity * selectedOffer.offeredPricePerUnit)}
              </div>
            </div>

            {/* Logistics Choices (Option A vs Option B) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {/* Option A: Use Logistics Partner */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: logisticsRequired ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                  backgroundColor: logisticsRequired ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="buyerLogisticsChoice"
                  checked={logisticsRequired === true}
                  onChange={() => setLogisticsRequired(true)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary-dark)', marginBottom: '3px' }}>
                    {t('optionLogisticsPartner')}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {t('optionLogisticsPartnerDesc')}
                  </p>
                </div>
              </label>

              {/* Option B: No Logistics Partner (Self-Arrangement) */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: !logisticsRequired ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                  backgroundColor: !logisticsRequired ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="buyerLogisticsChoice"
                  checked={logisticsRequired === false}
                  onChange={() => setLogisticsRequired(false)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {t('optionNoLogistics')}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {t('optionNoLogisticsDesc')}
                  </p>
                </div>
              </label>
            </div>

            {/* Option A Fields */}
            {logisticsRequired && (
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div>
                  <label className="form-label">{t('logisticsCharges')} (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(Number(e.target.value))}
                    min="0"
                  />
                </div>

                <div>
                  <label className="form-label">{t('deliveryLocationDetails')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryDetails}
                    onChange={(e) => setDeliveryDetails(e.target.value)}
                    placeholder="Enter warehouse or processing address"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setAcceptModalOpen(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
                disabled={accepting}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleAcceptOffer}
                className="btn-primary"
                style={{ flex: 1.5 }}
                disabled={accepting}
              >
                {accepting ? t('loading') : t('confirm')} & Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER OFFER MODAL */}
      {counterModalOpen && selectedOffer && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HandCoins size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('counterOffer')}</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Propose a new price per unit for {selectedOffer.quantity} {selectedOffer.unit} of {selectedOffer.cropName}:
            </p>

            <form onSubmit={handleCounterOffer}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('counterPriceInput')}</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '16px', fontWeight: 700 }}
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">{t('counterMessageInput')}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Can meet you in the middle at this price for immediate pickup."
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCounterModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  disabled={countering}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1.5 }}
                  disabled={countering}
                >
                  {countering ? t('loading') : t('sendCounterBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT HISTORY TIMELINE MODAL */}
      {historyModalOpen && (
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
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <History size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('negotiationTimeline')}</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Immutable audit ledger of price proposals and negotiation actions:
            </p>

            {loadingHistory ? (
              <LoadingSpinner message="Retrieving negotiation audit entries..." />
            ) : !historyData ? (
              <p style={{ color: 'var(--text-muted)' }}>No audit history records available.</p>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border-default)', marginBottom: '24px' }}>
                  {historyData.timeline?.map((step: any, idx: number) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-23px',
                          top: '2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: step.isSelf ? 'var(--primary)' : 'var(--ai-blue)',
                          border: '2px solid #ffffff',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.actorRole === 'FARMER' ? t('actorFarmer') : t('actorBuyer')} ({step.action})
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatDate(step.createdAt)}
                        </span>
                      </div>
                      {step.pricePerUnit && (
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '2px' }}>
                          ₹{step.pricePerUnit} /{historyData.unit}
                        </div>
                      )}
                      {step.message && (
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                          "{step.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  Close Audit Ledger
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
