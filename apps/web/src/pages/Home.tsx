import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Scale,
  Award,
  ChevronRight,
  Lock,
  Building2,
  Users,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { language } = useLanguage();
  const isMr = language === 'mr';
  const [quickCrop, setQuickCrop] = useState('Wheat');
  const [quickQty, setQuickQty] = useState(50);
  const quickEstPrice = quickCrop === 'Wheat' ? 2450 : quickCrop === 'Rice' ? 3200 : quickCrop === 'Soybean' ? 4400 : 2100;
  const quickGross = quickQty * quickEstPrice;

  const livePrices = [
    { crop: isMr ? 'गहू (शरबती)' : 'Wheat (Sharbati)', mandi: 'Pune APMC', price: '₹2,450 / q', change: '+2.4%' },
    { crop: isMr ? 'तांदूळ (बासमती)' : 'Rice (Basmati)', mandi: 'Nashik APMC', price: '₹3,200 / q', change: '+1.8%' },
    { crop: isMr ? 'सोयाबीन (पिवळा)' : 'Soybean (Yellow)', mandi: 'Latur APMC', price: '₹4,400 / q', change: '+3.1%' },
    { crop: isMr ? 'हरभरा (चना)' : 'Gram (Chana)', mandi: 'Nagpur APMC', price: '₹5,100 / q', change: '+0.9%' },
    { crop: isMr ? 'कांदा (लाल)' : 'Onion (Red)', mandi: 'Lasalgaon APMC', price: '₹1,950 / q', change: '-1.2%' },
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Live APMC Price Ticker */}
      <div
        className="no-scrollbar"
        style={{
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          padding: '8px 24px',
          fontSize: '12px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
          <span style={{ fontWeight: 700, color: '#4ade80', letterSpacing: '0.04em' }}>
            {isMr ? 'थेट कृषी उत्पन्न बाजार समिती (APMC) आधारभूत दर' : 'LIVE APMC MANDI BENCHMARKS'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexShrink: 0 }}>
          {livePrices.map((lp, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{lp.crop}:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{lp.price}</span>
              <span style={{ color: lp.change.startsWith('+') ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: 600 }}>
                {lp.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #f0fdf4 0%, #ffffff 80%)',
          padding: '72px 20px 84px 20px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '960px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--primary-border)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {isMr ? 'पुढील पिढीचे कृषी व्यापार आणि किंमत पारदर्शकता व्यासपीठ' : 'Next-Gen Agri Commerce & Price Transparency Platform'}
            </span>
          </div>

          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: '20px',
              letterSpacing: '-0.03em',
            }}
          >
            {isMr ? (
              <>शेतकऱ्यांसाठी रास्त भाव. <span style={{ color: 'var(--primary)' }}>खरेदीदारांसाठी थेट बाजारपेठ</span>.</>
            ) : (
              <>Fair Prices for Farmers. <span style={{ color: 'var(--primary)' }}>Direct Market Access</span> for Buyers.</>
            )}
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '780px',
              margin: '0 auto 36px auto',
            }}
          >
            {isMr ? (
              'पिकमूल्य शास्त्रीय बहु-घटक AI किंमत शोध, संगणक दृष्टी आधारित गुणवत्ता मूल्यांकन आणि थेट दलालमुक्त खरेदी-विक्रीद्वारे कृषी व्यापारात संपूर्ण पारदर्शकता आणते.'
            ) : (
              'PikMoolya solves agricultural price asymmetry through scientific multi-factor AI price discovery, computer vision crop quality certification, and direct middleman-free trade.'
            )}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link to="/marketplace" className="btn-primary btn-lg">
              {isMr ? 'बाजारपेठ पहा' : 'Explore Marketplace'} <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-secondary btn-lg">
              {isMr ? 'शेतकरी किंवा खरेदीदार नोंदणी' : 'Register as Farmer or Buyer'}
            </Link>
          </div>

          {/* Metric Highlights Bar */}
          <div className="home-metrics-grid">
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                ₹0
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                {isMr ? 'मध्यस्थ किंवा दलाली शुल्क' : 'Middleman Brokerage Fees'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ai-blue)', fontFamily: 'var(--font-heading)' }}>
                46+
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                {isMr ? 'पिके आणि वाणांचे आधारभूत दर' : 'Crops & Varietal Benchmarks'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                Grade A/B/C
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                {isMr ? 'संगणक दृष्टी गुणवत्ता मूल्यांकन' : 'Computer Vision Quality Proof'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--status-success)', fontFamily: 'var(--font-heading)' }}>
                100%
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
                {isMr ? 'सुरक्षित थेट व्यवहार पूर्तता' : 'Direct Trade Settlement'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Fair Price Estimator */}
      <section style={{ padding: '64px 20px', backgroundColor: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            className="card"
            style={{
              padding: '36px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1.5px solid var(--primary-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Scale size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {isMr ? 'थेट रास्त भाव गणक पूर्वावलोकन' : 'Interactive Fair Price Calculator Preview'}
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {isMr
                ? 'तुमच्या शेतमालाची नोंदणी करण्यापूर्वी थेट वैज्ञानिक किंमत शोध प्रणालीचा अनुभव घ्या:'
                : 'Experience the research pricing formula live before registering your produce listing:'}
            </p>

            <div className="home-calculator-grid">
              <div>
                <label className="form-label">{isMr ? 'पिकाचे नाव' : 'Crop Name'}</label>
                <select className="form-select" value={quickCrop} onChange={(e) => setQuickCrop(e.target.value)}>
                  <option value="Wheat">{isMr ? 'गहू (कल्याणसोना)' : 'Wheat (Kalyansona)'}</option>
                  <option value="Rice">{isMr ? 'तांदूळ (इंद्रायणी)' : 'Rice (Indrayani)'}</option>
                  <option value="Soybean">{isMr ? 'सोयाबीन (JS-335)' : 'Soybean (JS-335)'}</option>
                  <option value="Gram">{isMr ? 'हरभरा / चणा' : 'Gram / Chana'}</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  {isMr ? `प्रमाण: ${quickQty} क्विंटल` : `Quantity: ${quickQty} Quintals`}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={quickQty}
                  onChange={(e) => setQuickQty(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', marginTop: '10px' }}
                />
              </div>

              <div
                style={{
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-hover)', textTransform: 'uppercase' }}>
                  {isMr ? 'AI रास्त मूल्य अंदाज' : 'AI Fair Value Estimate'}
                </span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '2px' }}>
                  ₹{quickGross.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>(₹{quickEstPrice}/q)</span>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--primary)" />{' '}
                {isMr
                  ? 'MSAMB बाजार समिती आधारभूत दर आणि ऐतिहासिक हंगामावर आधारित'
                  : 'Calibrated with MSAMB mandi benchmarks and historical seasonality trends'}
              </span>
              <Link to="/farmer/prediction" className="btn-primary btn-sm">
                {isMr ? '५-घटक रास्त भाव शोध' : 'Full 5-Factor Price Discovery'} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ padding: '72px 20px', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              {isMr ? 'आधुनिक शेतीसाठी विशेष रचना' : 'Engineered For Modern Agriculture'}
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {isMr ? 'पिकमूल्य मुख्य आधारस्तंभ' : 'Core Architectural Pillars'}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0 auto' }}>
              {isMr
                ? 'दलालांच्या मक्तेदारीऐवजी पारदर्शक अल्गोरिदम आणि थेट पडताळणीयोग्य व्यापार'
                : 'Replacing middlemen monopolies with algorithmic transparency and direct verifiable trade'}
            </p>
          </div>

          <div className="grid-3">
            <div className="card card-interactive" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <TrendingUp size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                {isMr ? 'वैज्ञानिक रास्त भाव शोध' : 'Scientific Fair Price Discovery'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {isMr
                  ? 'पिकाचा वाण, काढणीची तारीख, अंतर, APMC ऐतिहासिक आकडेवारी आणि पुरवठा-मागणीवर आधारित रास्त भाव निश्चिती.'
                  : 'Empirical price estimation calculating fair benchmarks based on crop variety, harvest date, location proximity, APMC historical data, and live supply demand tension.'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> {isMr ? 'कमी भावात विक्रीपासून संरक्षण' : 'Protects against distress selling'}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--primary)" /> {isMr ? 'शेतकऱ्याचा उत्पादन खर्च सुरक्षित' : 'Calculates private farmer price floors'}
                </li>
              </ul>
            </div>

            <div className="card card-interactive" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--ai-blue-light)',
                  color: 'var(--ai-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                {isMr ? 'संगणक दृष्टी गुणवत्ता श्रेणीकरण' : 'Computer Vision Quality Grading'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {isMr
                  ? 'शेतकरी स्मार्टफोनने फोटो काढतात. AI मॉडेल दाण्यांचा आकार, रंग आणि गुणवत्तेचे विश्लेषण करून Grade A/B/C प्रमाणपत्र तयार करते.'
                  : 'Farmers photograph produce with a smartphone camera. Fast image feature analysis evaluates grain uniformity, surface discoloration, vibrancy, and generates Grade A/B/C proofs.'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--ai-blue)" /> {isMr ? 'पडताळणीयोग्य गुणवत्ता गुणपत्रिका' : 'Verifiable quality scorecard'}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--ai-blue)" /> {isMr ? 'प्रकाश व स्पष्टतेची तपासणी' : 'Blur and lighting validation'}
                </li>
              </ul>
            </div>

            <div className="card card-interactive" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <ShoppingCart size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                {isMr ? 'थेट कृषी बाजारपेठ' : 'Direct Agricultural Marketplace'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                {isMr
                  ? 'गिरणी मालक, घाऊक व्यापारी आणि फूड प्रोसेसर्सशी थेट व्यवहार. पारदर्शक घासाघीस आणि थेट ऑर्डर पूर्तता.'
                  : 'Connect directly with institutional millers, wholesale traders, and food processors. Partial quantity order fulfillment, atomic inventory reservations, and delivery status tracking.'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--accent)" /> {isMr ? 'थेट खरेदीदार-शेतकरी संपर्क' : 'Direct Buyer-Farmer connection'}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--accent)" /> {isMr ? 'ऐच्छिक वाहतूकदार व्यवस्था' : 'Optional verified logistics'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works: 3 Steps */}
      <section style={{ padding: '72px 20px', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-default)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
              {isMr ? 'पिकमूल्य कसे कार्य करते' : 'How PikMoolya Works'}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {isMr ? 'शेतकऱ्याच्या शेतापासून खात्रीशीर बँक पेमेंटपर्यंत तीन सोप्या टप्प्यांत' : 'From field harvest to direct settlement in three simple steps'}
            </p>
          </div>

          <div className="home-steps-grid">
            <div className="card" style={{ padding: '28px', position: 'relative' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                {isMr ? 'टप्पा ०१' : 'STEP 01'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {isMr ? 'शेतमाल नोंदणी व भाव शोध' : 'List & Price Discovery'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isMr
                  ? 'पिकाचा तपशील आणि प्रमाण नोंदवा. पिकमूल्य आधारभूत रास्त भाव मोजून तुमचा किमान उत्पादन खर्च सुरक्षित ठेवते.'
                  : 'Enter crop details and harvest quantity. PikMoolya calculates your benchmark fair price and sets your private cost floor to prevent undervalued sales.'}
              </p>
            </div>

            <div className="card" style={{ padding: '28px', position: 'relative' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ai-blue)', marginBottom: '8px' }}>
                {isMr ? 'टप्पा ०२' : 'STEP 02'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {isMr ? 'AI गुणवत्ता तपासणी' : 'Upload Quality Proof'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isMr
                  ? 'शेतमालाचा फोटो अपलोड करा. AI विश्लेषण स्वच्छतेनुसार Grade A/B/C रेटिंग आणि डिजिटल प्रमाणपत्र जारी करते.'
                  : 'Snap a daylight photo of your crop grains. Computer vision analysis assigns Grade A/B/C ratings, certifying cleanliness and size uniformity to buyers.'}
              </p>
            </div>

            <div className="card" style={{ padding: '28px', position: 'relative' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>
                {isMr ? 'टप्पा ०३' : 'STEP 03'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                {isMr ? 'थेट ऑर्डर व व्यवहार' : 'Direct Order & Fulfillment'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isMr
                  ? 'खरेदीदार थेट आवश्यक प्रमाणात मागणी नोंदवतात. पारदर्शक वाटाघाटी करून व्यवहार त्वरित पूर्ण करा.'
                  : 'Buyers order exact quantities directly. Negotiate mutually fair rates and settle orders without intermediary deductions.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '64px 20px', backgroundColor: '#ffffff' }}>
        <div
          className="container"
          style={{
            maxWidth: '1000px',
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px',
            color: '#ffffff',
            boxShadow: '0 20px 30px rgba(21, 128, 61, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              {isMr ? 'रास्त कृषी व्यापारासाठी तयार आहात?' : 'Ready for Fair Agricultural Commerce?'}
            </h2>
            <p style={{ fontSize: '16px', color: '#bbf7d0', maxWidth: '520px' }}>
              {isMr
                ? 'योग्य आधारभूत दर मिळवणारे शेतकरी आणि थेट खरेदी करणारे व्यापारी यांच्या समुदायात सामील व्हा.'
                : 'Join thousands of farmers getting benchmark fair value and verified buyers sourcing directly.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ backgroundColor: '#ffffff', color: '#14532d', padding: '14px 28px', fontSize: '16px' }}>
              {isMr ? 'मोफत खाते तयार करा' : 'Create Free Account'} <ArrowRight size={18} />
            </Link>
            <Link to="/marketplace" className="btn-outline" style={{ color: '#ffffff', borderColor: '#ffffff', padding: '14px 24px', fontSize: '16px' }}>
              {isMr ? 'शेतमाल यादी पहा' : 'Browse Listings'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
