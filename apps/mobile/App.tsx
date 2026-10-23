import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useEffect, useMemo, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';

import {
  Language,
  getLanguage,
  setLanguage,
  initLanguage,
  subscribeLanguageChange,
  t,
} from './src/utils/i18n';
import { theme } from './src/theme/theme';
import { AppHeader } from './src/components/AppHeader';
import { LanguageSelectorModal } from './src/components/LanguageSelectorModal';
import { AccountSelectorModal, AccountType } from './src/components/AccountSelectorModal';
import { CameraCaptureModal } from './src/components/CameraCaptureModal';
import { StatusBadge } from './src/components/StatusBadge';
import { CropSelectorModal } from './src/components/CropSelectorModal';
import { CounterOfferModal } from './src/components/CounterOfferModal';
import { AcceptOfferModal } from './src/components/AcceptOfferModal';
import { EmptyState } from './src/components/EmptyState';
import { LocationSelectorModal } from './src/components/LocationSelectorModal';
import { SelectionBottomSheet, SelectionOption } from './src/components/SelectionBottomSheet';
import { NotificationModal, AppNotification } from './src/components/NotificationModal';
import { OrderTimeline } from './src/components/OrderTimeline';
import { LogisticsCard, LogisticsRequestData } from './src/components/LogisticsCard';
import { AdminDashboardView, AdminStats } from './src/components/AdminDashboardView';
import { PikMoolyaLogo } from './src/components/branding/PikMoolyaLogo';
import { LiveApmcTicker } from './src/components/LiveApmcTicker';

const rawApiUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://10.108.139.217:3000').trim().replace(/\/+$/, '');
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
const AI_SERVICE_URL = (process.env.EXPO_PUBLIC_AI_URL || 'http://10.108.139.217:8000').trim().replace(/\/+$/, '');

const getCropImage = (cropName: string = '', fallbackUrl?: string) => {
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
  if (fallbackUrl && fallbackUrl.startsWith('http') && !fallbackUrl.includes('photo-1592924357228')) {
    return fallbackUrl;
  }
  return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
};


type Screen =
  | 'home'
  | 'add'
  | 'listing'
  | 'offers'
  | 'orders'
  | 'buyer'
  | 'buyer_search'
  | 'price'
  | 'quality'
  | 'profile'
  | 'certificate'
  | 'my_certificates'
  | 'verify'
  | 'messages'
  | 'requests'
  | 'deliveries'
  | 'users'
  | 'reports';

type UserRole = 'FARMER' | 'BUYER' | 'LOGISTICS_PARTNER' | 'ADMIN';
type AuthMode = 'signin' | 'signup';

type Crop = {
  id: string;
  name: string;
  variety?: string;
  unit?: string;
  isActive?: boolean;
};

type Listing = {
  listingId?: string;
  id?: string;
  crop?: Crop;
  cropId?: string;
  quantity?: number | string;
  totalAvailableQuantity?: number | string;
  remainingQuantity?: number | string;
  soldQuantity?: number | string;
  minBuyerQuantity?: number | string;
  numberOfBags?: number | string;
  avgBagWeight?: number | string;
  measuredQuantity?: number | string;
  measurementMethod?: string;
  measurementSource?: string;
  unit?: string;
  expectedPrice?: number | string;
  minAcceptablePrice?: number | string;
  priceFloor?: number | string;
  negotiationPreference?: string;
  deliveryPreference?: string;
  qualityDescription?: string;
  visibleCondition?: string;
  storageInfo?: string;
  photoUri?: string;
  imageUrl?: string;
  photoUrl?: string;
  locationApproximate?: string;
  locationName?: string;
  harvestDate?: string;
  status?: string;
  createdAt?: string;
};

type CapturedPhoto = {
  id: string;
  uri: string;
  base64?: string;
  captureDate: string;
  captureTime: string;
  uploadDate: string;
  uploadTime: string;
  locationStatus: string;
};

const money = (value: any) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const number = Number(value);
  if (!Number.isFinite(number)) return 'N/A';
  return `₹${number.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const getApiErrorMessage = (error: any, fallback: string) => {
  if (
    error?.name === 'AbortError' ||
    error?.code === 'ECONNABORTED' ||
    (typeof error?.message === 'string' && error.message.toLowerCase().includes('timeout'))
  ) {
    return 'Connection timed out. The server took too long to respond. Please check your network and try again.';
  }

  if (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    error?.message === 'Network request failed' ||
    (!error?.response && error?.request)
  ) {
    return `Unable to reach PikMoolya server (${API_URL}). Please ensure your phone is connected to the hotspot Wi-Fi and the server is running.`;
  }

  const rawMessage =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  if (Array.isArray(rawMessage)) {
    return rawMessage
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.message) return String(item.message);
        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .join('\n');
  }

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    return rawMessage;
  }

  if (rawMessage !== undefined && rawMessage !== null) {
    return String(rawMessage);
  }

  return fallback;
};

const getListingId = (listing: Listing) =>
  listing.listingId ?? listing.id ?? '';

const MAHARASHTRA_CROP_CATALOG: Crop[] = [
  { id: 'catalog-tomato', name: 'Tomato', variety: 'Fresh Tomato' },
  { id: 'catalog-onion-red', name: 'Onion', variety: 'Red Onion' },
  { id: 'catalog-potato', name: 'Potato', variety: 'Table Potato' },
  { id: 'catalog-wheat', name: 'Wheat', variety: 'Lokwan Wheat' },
  { id: 'catalog-rice', name: 'Rice', variety: 'Basmati Rice' },
  { id: 'catalog-soybean', name: 'Soybean', variety: 'Yellow Soybean' },
  { id: 'catalog-cotton', name: 'Cotton', variety: 'Medium Staple' },
  { id: 'catalog-sugarcane', name: 'Sugarcane', variety: 'Co 86032' },
  { id: 'catalog-green-chilli', name: 'Chilli', variety: 'Green Chilli' },
  { id: 'catalog-grapes', name: 'Grapes', variety: 'Thomson Seedless' },
  { id: 'catalog-pomegranate', name: 'Pomegranate', variety: 'Bhagwa' },
  { id: 'catalog-banana', name: 'Banana', variety: 'Grand Naine' },
  { id: 'catalog-turmeric', name: 'Turmeric', variety: 'Rajapuri' },
  { id: 'catalog-maize', name: 'Maize', variety: 'Yellow Maize' },
];

const UNIT_OPTIONS: SelectionOption[] = [
  { id: 'kg', label: 'Kilogram (kg)', subLabel: 'Standard weight measurement', icon: 'scale-outline' },
  { id: 'quintal', label: 'Quintal (q)', subLabel: '100 Kilograms', icon: 'cube-outline' },
  { id: 'ton', label: 'Tonne (t)', subLabel: '1,000 Kilograms', icon: 'bus-outline' },
  { id: 'crate', label: 'Crate', subLabel: 'Approx 20-25 kg (Crop specific)', icon: 'archive-outline' },
];

const OFFER_FILTER_OPTIONS: SelectionOption[] = [
  { id: 'ALL', label: 'All Offers', subLabel: 'View all buyer offers received' },
  { id: 'PENDING', label: 'Pending Offers', subLabel: 'Offers awaiting your decision' },
  { id: 'COUNTERED', label: 'Countered Offers', subLabel: 'Offers with active counter-offers' },
  { id: 'ACCEPTED', label: 'Accepted Offers', subLabel: 'Confirmed transactions' },
];

export default function App() {
  const [lang, setLangState] = useState<Language>('en');

  // Authentication Form State
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('Farmer@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Dropdown Bottom Sheet Modal States
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [offerFilterModalVisible, setOfferFilterModalVisible] = useState(false);
  const [selectedOfferFilter, setSelectedOfferFilter] = useState('ALL');

  // Active Session State
  const [token, setToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('Farmer');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [dashboard, setDashboard] = useState<any>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  // Form State (Minimal Simple Farmer Input)
  const [addStep, setAddStep] = useState<number>(1);
  const [totalAvailableQty, setTotalAvailableQty] = useState('500');
  const [qtyUnit, setQtyUnit] = useState<string>('kg');
  const [quantityToSell, setQuantityToSell] = useState('500');
  const [expectedPrice, setExpectedPrice] = useState('33');
  const [locationName, setLocationName] = useState('Pune District');

  // Automatic Market Analysis State
  const [marketAnalysisData, setMarketAnalysisData] = useState<any>(null);
  const [marketAnalysisLoading, setMarketAnalysisLoading] = useState(false);
  const [showHowCalculated, setShowHowCalculated] = useState(false);

  // Orders & Real-time Logistics Net Return Recalculation State
  const LOGISTICS_PARTNERS = [
    { id: 'logistics-a', name: 'Logistics Partner A', vehicle: 'Mini Truck (Bolero)', cost: 1200, eta: '3 hours' },
    { id: 'logistics-b', name: 'Logistics Partner B', vehicle: 'Tempo (14-ft)', cost: 1500, eta: '2 hours' },
    { id: 'logistics-c', name: 'Direct Farm Transport', vehicle: 'Pickup Truck', cost: 950, eta: '5 hours' },
  ];
  const [selectedLogisticsId, setSelectedLogisticsId] = useState('logistics-a');

  // Camera & Image State
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [capturedPhotoTemp, setCapturedPhotoTemp] = useState<{ uri: string; base64?: string } | null>(null);
  const [confirmedPhoto, setConfirmedPhoto] = useState<CapturedPhoto | null>(null);
  const cameraRef = useRef<any>(null);

  // Quality Assessment State
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [qualityLoading, setQualityLoading] = useState(false);

  // Certificates State
  const [activeCertificate, setActiveCertificate] = useState<any>(null);
  const [myCertificatesList, setMyCertificatesList] = useState<any[]>([]);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [certLoading, setCertLoading] = useState(false);

  // General Loading & Navigation State
  const [loading, setLoading] = useState(false);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<any>(null);
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [selectedOfferForAccept, setSelectedOfferForAccept] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Buyer State
  const [buyerDashboard, setBuyerDashboard] = useState<any>(null);
  const [buyerOffers, setBuyerOffers] = useState<any[]>([]);
  const [farmerOffers, setFarmerOffers] = useState<any[]>([]);
  const [selectedBuyerListing, setSelectedBuyerListing] = useState<any>(null);
  const [buyerOfferPrice, setBuyerOfferPrice] = useState('');
  const [buyerOfferQuantity, setBuyerOfferQuantity] = useState('');
  const [buyerOfferMessage, setBuyerOfferMessage] = useState('');
  const [buyerRequiredQty, setBuyerRequiredQty] = useState('500');

  // Quick Estimator State on Farmer Dashboard (matching Website)
  const [quickCrop, setQuickCrop] = useState<string>('Wheat');
  const [quickQty, setQuickQty] = useState<number>(50);
  const quickEstPrice = quickCrop === 'Wheat' ? 2450 : quickCrop === 'Rice' ? 3200 : quickCrop === 'Soybean' ? 4400 : 2100;
  const quickGross = quickQty * quickEstPrice;

  // Marketplace Category Filter Pills & Products
  const [activeMarketCategory, setActiveMarketCategory] = useState<string>('ALL');
  const [marketplaceProducts, setMarketplaceProducts] = useState<any[]>([]);

  const fetchMarketplaceProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      if (res.data?.data?.products) {
        setMarketplaceProducts(res.data.data.products);
      }
    } catch (e: any) {
      console.log('Error fetching marketplace products:', e?.message);
    }
  };

  // Role-Based Workflow System States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [notificationModalVisible, setNotificationModalVisible] = useState<boolean>(false);
  const [logisticsRequests, setLogisticsRequests] = useState<LogisticsRequestData[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    initLanguage().then((l) => setLangState(l));
    const unsubscribe = subscribeLanguageChange((l) => setLangState(l));
    return unsubscribe;
  }, []);

  const changeLanguageHandler = async (newLang: Language) => {
    await setLanguage(newLang);
    setLangState(newLang);
  };

  const listings: Listing[] =
    dashboard?.produce?.listings ??
    dashboard?.produce?.activeListings ??
    [];

  const selectedCropLabel = useMemo(() => {
    if (!selectedCrop) return t('selectCrop', lang);
    return `${selectedCrop.name}${selectedCrop.variety ? ` (${selectedCrop.variety})` : ''}`;
  }, [selectedCrop, lang]);

  // Run Net Selling Return Analysis whenever parameters change or screen opens
  useEffect(() => {
    if (screen === 'price') {
      runNetSellingReturnAnalysis();
    }
  }, [screen, selectedCrop, quantityToSell, qtyUnit, locationName]);

  const runNetSellingReturnAnalysis = async () => {
    try {
      setMarketAnalysisLoading(true);
      const payload = {
        cropId: selectedCrop?.id,
        cropName: selectedCrop?.name || 'Tomato',
        quantity: Number(quantityToSell || 500),
        unit: qtyUnit,
        district: locationName,
        qualityScore: aiAssessment?.quality?.score ? Number(aiAssessment.quality.score) : 87,
      };

      const res = await axios.post(`${API_URL}/market-optimizer/best-market`, payload, {
        headers: token ? authHeaders(token) : {},
      });

      setMarketAnalysisData(res.data);
      if (res.data?.recommendedMarket?.recommendedAskingPricePerKg) {
        setExpectedPrice(String(res.data.recommendedMarket.recommendedAskingPricePerKg));
      }
    } catch (err: any) {
      console.log('Net selling return analysis failed:', err?.message);
    } finally {
      setMarketAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (token && (screen === 'add' || screen === 'price')) {
      loadCrops(token);
    }
  }, [token, screen]);

  useEffect(() => {
    if (token) {
      fetchNotifications(token);
      if (userRole === 'FARMER') {
        loadDashboard(token);
        fetchFarmerOffers(token);
      } else if (userRole === 'BUYER') {
        loadBuyerDashboard(token);
        loadBuyerOffers(token);
        fetchMarketplaceProducts();
      } else if (userRole === 'LOGISTICS_PARTNER') {
        fetchLogisticsRequests(token);
      } else if (userRole === 'ADMIN') {
        fetchAdminStats(token);
        fetchLogisticsRequests(token);
      }
    }
  }, [token, userRole, screen]);

  // Messaging & Chat State
  const [messagesList, setMessagesList] = useState<any[]>([
    { id: 'm1', senderName: 'Reliance Fresh (Buyer)', senderRole: 'BUYER', text: 'Is the 500 kg Tomato produce batch ready for morning pickup?', timestamp: '10:15 AM', linkedItem: 'Order #PM-98421' },
    { id: 'm2', senderName: 'Farmer Ramesh', senderRole: 'FARMER', text: 'Yes, crates are packaged and ready at the farm gate.', timestamp: '10:20 AM', linkedItem: 'Order #PM-98421' },
    { id: 'm3', senderName: 'Logistics Partner A', senderRole: 'LOGISTICS_PARTNER', text: 'Pickup truck (Bolero) dispatched. ETA 30 minutes.', timestamp: '10:30 AM', linkedItem: 'Order #PM-98421' },
  ]);
  const [chatInputText, setChatInputText] = useState('');

  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;
    const msgObj = {
      id: `msg-${Date.now()}`,
      senderName: userName || (userRole === 'FARMER' ? 'Farmer' : userRole === 'BUYER' ? 'Buyer' : userRole === 'LOGISTICS_PARTNER' ? 'Logistics Partner' : 'Admin'),
      senderRole: userRole,
      text: chatInputText.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      linkedItem: 'Order #PM-98421',
    };
    setMessagesList((prev) => [...prev, msgObj]);
    setChatInputText('');
    showToast('Message sent.');
  };

  const ALLOWED_ROLE_SCREENS: Record<UserRole, Screen[]> = {
    FARMER: ['home', 'add', 'listing', 'offers', 'orders', 'messages', 'price', 'quality', 'certificate', 'my_certificates', 'verify', 'profile'],
    BUYER: ['buyer', 'buyer_search', 'offers', 'orders', 'messages', 'profile', 'certificate', 'my_certificates', 'verify', 'home'],
    LOGISTICS_PARTNER: ['home', 'requests', 'deliveries', 'orders', 'messages', 'profile'],
    ADMIN: ['home', 'users', 'listing', 'offers', 'orders', 'requests', 'reports', 'messages', 'profile'],
  };

  const checkPermission = (targetScreen: Screen, role: UserRole | null = userRole): boolean => {
    if (!role) return false;
    const allowed = ALLOWED_ROLE_SCREENS[role] || [];
    if (!allowed.includes(targetScreen)) {
      Alert.alert('Permission Denied', "You don't have permission to access this page.");
      return false;
    }
    return true;
  };

  const navigateTo = (targetScreen: Screen) => {
    console.log(`[DASHBOARD ROUTING] Target: ${targetScreen}, Active Role: ${userRole}`);
    if (checkPermission(targetScreen)) {
      setScreen(targetScreen);
    }
  };

  const handleLogout = () => {
    console.log('[LOGOUT] Clearing user session, tokens, role, and navigation state.');
    setToken(null);
    setUserRole(null);
    setUserName('Farmer');
    setDashboard(null);
    setBuyerDashboard(null);
    setBuyerOffers([]);
    setFarmerOffers([]);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setLogisticsRequests([]);
    setAdminStats(null);
    setSelectedListing(null);
    setSelectedBuyerListing(null);
    setMarketAnalysisData(null);
    setAiAssessment(null);
    setConfirmedPhoto(null);
    setScreen('home');
    setAuthMode('signin');
    resetForm();
  };

  const authHeaders = (jwt = token!) => ({
    Authorization: `Bearer ${jwt}`,
  });

  const login = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setAuthError('');
      setAuthSuccessMsg('');

      const rawPhone = phone.trim();
      const normalizedPhone = rawPhone.startsWith('+')
        ? rawPhone
        : rawPhone.length === 10
        ? `+91${rawPhone}`
        : rawPhone;

      let response: any;
      try {
        response = await axios.post(
          `${API_URL}/auth/login`,
          {
            phone: normalizedPhone,
            password,
          },
          { timeout: 10000 }
        );
      } catch (firstErr: any) {
        if (
          normalizedPhone !== rawPhone &&
          firstErr?.response?.status === 401
        ) {
          response = await axios.post(
            `${API_URL}/auth/login`,
            {
              phone: rawPhone,
              password,
            },
            { timeout: 10000 }
          );
        } else {
          throw firstErr;
        }
      }

      const jwt =
        response.data?.accessToken ??
        response.data?.token ??
        response.data?.access_token;

      if (!jwt) throw new Error('JWT token not found');

      let serverRole: UserRole = (response.data?.user?.role as UserRole) || 'FARMER';
      let name = response.data?.user?.name || 'User';

      try {
        const meResponse = await axios.get(API_URL + '/auth/me', {
          headers: authHeaders(jwt),
          timeout: 10000,
        });
        if (meResponse.data?.user?.role) {
          serverRole = meResponse.data.user.role as UserRole;
        }
        if (meResponse.data?.user?.name) {
          name = meResponse.data.user.name;
        }
      } catch (meErr) {
        if (response.data?.user?.role) {
          serverRole = response.data.user.role as UserRole;
        }
        if (response.data?.user?.name) {
          name = response.data.user.name;
        }
      }

      console.log(`[LOGIN SUCCESS] Authenticated User: ${name}, Server Role: ${serverRole}`);

      setSelectedRole(serverRole);
      setUserName(name);
      setUserRole(serverRole);
      setToken(jwt);

      if (serverRole === 'FARMER') {
        await Promise.all([loadDashboard(jwt), loadCrops(jwt)]);
        setScreen('home');
      } else if (serverRole === 'BUYER') {
        await loadBuyerDashboard(jwt);
        await loadBuyerOffers(jwt);
        setScreen('buyer');
      } else if (serverRole === 'LOGISTICS_PARTNER') {
        await fetchLogisticsRequests(jwt);
        setScreen('home');
      } else if (serverRole === 'ADMIN') {
        await Promise.all([fetchAdminStats(jwt), fetchLogisticsRequests(jwt)]);
        setScreen('home');
      } else {
        setScreen('home');
      }
    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'Invalid phone number or password.'));
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setAuthError('');
      setAuthSuccessMsg('');

      if (!regPhone.trim()) {
        setAuthError(t('enterPhone', lang));
        setLoading(false);
        return;
      }
      if (!regPassword) {
        setAuthError(t('enterPassword', lang));
        setLoading(false);
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setAuthError(t('passwordsDoNotMatch', lang));
        setLoading(false);
        return;
      }

      const rawRegPhone = regPhone.trim();
      const normalizedRegPhone = rawRegPhone.startsWith('+')
        ? rawRegPhone
        : rawRegPhone.length === 10
        ? `+91${rawRegPhone}`
        : rawRegPhone;

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          phone: normalizedRegPhone,
          password: regPassword,
          role: selectedRole,
          preferredLanguage: lang,
        },
        { timeout: 10000 }
      );

      const jwt =
        response.data?.accessToken ??
        response.data?.token ??
        response.data?.access_token;

      if (jwt) {
        let serverRole: UserRole = selectedRole;
        try {
          const meResponse = await axios.get(API_URL + '/auth/me', {
            headers: authHeaders(jwt),
            timeout: 10000,
          });
          serverRole = (meResponse.data?.user?.role as UserRole) || response.data?.user?.role || selectedRole;
        } catch {
          serverRole = (response.data?.user?.role as UserRole) || selectedRole;
        }

        console.log(`[LOGIN SUCCESS] Registered & Logged in as Role: ${serverRole}`);

        setToken(jwt);
        setUserRole(serverRole);
        if (regName) setUserName(regName);

        if (serverRole === 'FARMER') {
          await Promise.all([loadDashboard(jwt), loadCrops(jwt)]);
          setScreen('home');
        } else if (serverRole === 'BUYER') {
          await loadBuyerDashboard(jwt);
          await loadBuyerOffers(jwt);
          setScreen('buyer');
        } else if (serverRole === 'LOGISTICS_PARTNER') {
          await fetchLogisticsRequests(jwt);
          setScreen('home');
        } else if (serverRole === 'ADMIN') {
          await Promise.all([fetchAdminStats(jwt), fetchLogisticsRequests(jwt)]);
          setScreen('home');
        } else {
          setScreen('home');
        }
      } else {
        setAuthSuccessMsg(t('accountCreatedSuccess', lang));
        setPhone(regPhone);
        setPassword(regPassword);
        setAuthMode('signin');
      }
    } catch (error: any) {
      setAuthError(getApiErrorMessage(error, 'An account with this phone number already exists.'));
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerDashboard = async (jwt = token!) => {
    try {
      const response = await axios.get(API_URL + '/buyer-dashboard', { headers: authHeaders(jwt), timeout: 10000 });
      setBuyerDashboard(response.data);
    } catch (err: any) {
      console.log('Buyer dashboard load error:', err?.message);
    }
  };

  const loadBuyerOffers = async (jwt = token!) => {
    try {
      const response = await axios.get(API_URL + '/offers/my', { headers: authHeaders(jwt), timeout: 10000 });
      setBuyerOffers(Array.isArray(response.data) ? response.data : response.data?.offers ?? []);
    } catch (err: any) {
      console.log('Buyer offers load error:', err?.message);
    }
  };

  const fetchFarmerOffers = async (jwt = token!) => {
    try {
      const response = await axios.get(API_URL + '/offers/farmer/all', { headers: authHeaders(jwt), timeout: 10000 });
      setFarmerOffers(Array.isArray(response.data) ? response.data : response.data?.offers ?? []);
    } catch (err: any) {
      console.log('Farmer offers load error:', err?.message);
    }
  };

  const fetchNotifications = async (jwt = token!) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, { headers: authHeaders(jwt), timeout: 10000 });
      setNotifications(Array.isArray(response.data) ? response.data : []);
      const countRes = await axios.get(`${API_URL}/notifications/unread-count`, { headers: authHeaders(jwt), timeout: 10000 });
      setUnreadNotificationsCount(countRes.data?.unreadCount || 0);
    } catch (err: any) {
      console.log('Notifications load error:', err?.message);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: authHeaders() });
      if (token) fetchNotifications(token);
    } catch (err: any) {}
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, { headers: authHeaders() });
      if (token) fetchNotifications(token);
    } catch (err: any) {}
  };

  const fetchLogisticsRequests = async (jwt = token!) => {
    try {
      const response = await axios.get(`${API_URL}/logistics/requests`, { headers: authHeaders(jwt), timeout: 10000 });
      setLogisticsRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.log('Logistics requests load error:', err?.message);
    }
  };

  const handleAcceptLogisticsRequest = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.patch(`${API_URL}/logistics/requests/${id}/accept`, {}, { headers: authHeaders() });
      const msg = res.data?.message || 'Delivery request accepted. Farmer and buyer notified.';
      showToast(msg);
      Alert.alert('Request Accepted', msg);
      if (token) {
        fetchLogisticsRequests(token);
        fetchNotifications(token);
      }
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to accept delivery request.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLogisticsRequest = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.patch(`${API_URL}/logistics/requests/${id}/reject`, {}, { headers: authHeaders() });
      const msg = res.data?.message || 'Delivery request rejected.';
      showToast(msg);
      if (token) fetchLogisticsRequests(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to reject request.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLogisticsStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      const res = await axios.patch(`${API_URL}/logistics/requests/${id}/status`, { status }, { headers: authHeaders() });
      const msg = res.data?.message || `Status updated to ${status}. Farmer and buyer notified.`;
      showToast(msg);
      Alert.alert('Status Updated', msg);
      if (token) {
        fetchLogisticsRequests(token);
        fetchNotifications(token);
      }
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to update status.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async (jwt = token!) => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, { headers: authHeaders(jwt), timeout: 10000 });
      setAdminStats(response.data);
    } catch (err: any) {
      console.log('Admin stats load error:', err?.message);
    }
  };

  const handleWithdrawBuyerOffer = async (offerId: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/offers/${offerId}/withdraw`, {}, { headers: authHeaders() });
      const msg = res.data?.message || 'Offer withdrawn successfully.';
      showToast(msg);
      Alert.alert('Offer Withdrawn', msg);
      if (token) loadBuyerOffers(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to withdraw offer.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBuyerOffer = async (listingId: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/offers`,
        {
          listingId,
          offerPrice: Number(buyerOfferPrice),
          quantity: Number(buyerOfferQuantity || 500),
          message: buyerOfferMessage || 'Direct purchase offer',
        },
        { headers: authHeaders() }
      );
      const msg = res.data?.message || 'Offer submitted to farmer!';
      showToast(msg);
      Alert.alert('Offer Submitted', msg);
      setSelectedBuyerListing(null);
      if (token) loadBuyerOffers(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to submit offer.'));
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (jwt: string) => {
    try {
      const response = await axios.get(`${API_URL}/farmer-dashboard`, {
        headers: authHeaders(jwt),
        timeout: 10000,
      });

      const raw = response.data;
      const dashboardData = raw?.data ?? raw?.dashboard ?? raw;
      const produceData = dashboardData?.produce ?? {};
      const activeListings = produceData?.activeListings ?? produceData?.listings ?? produceData?.items ?? [];

      const normalizedDashboard = {
        ...dashboardData,
        produce: {
          ...produceData,
          activeListings: Array.isArray(activeListings) ? activeListings : [],
          listings: Array.isArray(produceData?.listings) ? produceData.listings : Array.isArray(activeListings) ? activeListings : [],
        },
      };

      setDashboard(normalizedDashboard);
    } catch (error: any) {
      console.log('Dashboard error:', error?.message);
    }
  };

  const handleAcceptOffer = async (offerId: string, options?: any) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/offers/${offerId}/accept`, options || {}, { headers: authHeaders() });
      Alert.alert(
        'Offer Accepted',
        options?.logisticsRequired
          ? 'You have accepted the offer! Order created with logistics partner assistance.'
          : 'You have accepted the offer! Order created for direct self-pickup without logistics partner.'
      );
      if (token) await loadDashboard(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to accept offer.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/offers/${offerId}/reject`, {}, { headers: authHeaders() });
      Alert.alert('Offer Rejected', 'Offer has been rejected.');
      if (token) await loadDashboard(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to reject offer.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCounterOffer = async (offerId: string, counterPrice: number) => {
    try {
      await axios.post(
        `${API_URL}/offers/${offerId}/counter`,
        { counterPricePerUnit: counterPrice },
        { headers: authHeaders() }
      );
      Alert.alert('Counter Offer Sent', `Your counter offer of ₹${counterPrice}/kg has been sent.`);
      if (token) await loadDashboard(token);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Unable to send counter offer.'));
    }
  };

  const loadCrops = async (jwt: string) => {
    try {
      const response = await axios.get(`${API_URL}/crops`, {
        headers: authHeaders(jwt),
        timeout: 10000,
      });

      const raw = response.data;
      const data: Crop[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
            ? raw.items
            : [];

      const validCrops = data.filter((crop: any) => crop && typeof crop.id === 'string' && crop.name);
      if (validCrops.length > 0) {
        setCrops(validCrops);
        if (!selectedCrop) setSelectedCrop(validCrops[0]);
      } else {
        setCrops(MAHARASHTRA_CROP_CATALOG);
        if (!selectedCrop) setSelectedCrop(MAHARASHTRA_CROP_CATALOG[0]);
      }
    } catch (error: any) {
      setCrops(MAHARASHTRA_CROP_CATALOG);
      if (!selectedCrop) setSelectedCrop(MAHARASHTRA_CROP_CATALOG[0]);
    }
  };

  // Camera Functions
  const handleOpenRealCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          t('cameraPermissionRequired', lang),
          'Please enable camera permissions in device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: t('openSettings', lang), onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    setCapturedPhotoTemp(null);
    setCameraModalVisible(true);
  };

  const handleOpenGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        exif: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        let exifDateStr: string | null = null;
        if (asset.exif) {
          const rawDate = asset.exif.DateTimeOriginal || asset.exif['{Exif}']?.DateTimeOriginal;
          if (rawDate) {
            exifDateStr = String(rawDate);
          }
        }

        const now = new Date();
        const photoObj: CapturedPhoto = {
          id: 'photo-' + Date.now(),
          uri: asset.uri,
          base64: asset.base64 || undefined,
          captureDate: now.toISOString().split('T')[0],
          captureTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          uploadDate: now.toISOString().split('T')[0],
          uploadTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          locationStatus: 'Uploaded from device gallery',
        };

        setConfirmedPhoto(photoObj);

        if (asset.base64) {
          await runAiQualityAssessment(asset.base64, null, 'GALLERY', now.toISOString(), exifDateStr);
        }
      }
    } catch (err: any) {
      Alert.alert('Gallery error', 'Could not open image picker.');
    }
  };

  const runAiQualityAssessment = async (
    base64String: string,
    captureSessionId?: string | null,
    captureMethod: 'CAMERA' | 'GALLERY' = 'CAMERA',
    capturedAt?: string,
    exifCaptureDate?: string | null
  ) => {
    try {
      setQualityLoading(true);
      const res = await axios.post(
        `${API_URL}/quality-verification/assess`,
        {
          imageBase64: base64String,
          cropName: selectedCrop?.name || 'Produce',
          variety: selectedCrop?.variety,
          captureSessionId: captureSessionId || undefined,
          captureMethod,
          capturedAt: capturedAt || new Date().toISOString(),
          exifCaptureDate: exifCaptureDate || undefined,
        },
        { headers: authHeaders() }
      );
      setAiAssessment(res.data);
    } catch (err: any) {
      try {
        const pyRes = await axios.post(`${AI_SERVICE_URL}/analyze-quality`, {
          image_base64: base64String,
          crop_name: selectedCrop?.name || 'Produce',
          variety: selectedCrop?.variety,
        });
        setAiAssessment({
          quality: {
            score: pyRes.data.quality_score,
            grade: pyRes.data.quality_grade,
            visibleCondition: pyRes.data.visible_condition,
            detectedIssues: pyRes.data.detected_issues,
            confidence: pyRes.data.confidence_percentage,
            dimensions: pyRes.data.quality_metrics,
            imageQuality: pyRes.data.image_quality,
          },
          captureAuthenticity: {
            method: captureMethod,
            statusText: captureMethod === 'CAMERA'
              ? 'Captured using PikMoolya camera'
              : exifCaptureDate
                ? `Uploaded from gallery (Original photo date: ${exifCaptureDate})`
                : 'Uploaded from device gallery',
          },
        });
      } catch (pyErr: any) {
        console.log('AI quality error:', pyErr?.message);
      }
    } finally {
      setQualityLoading(false);
    }
  };

  const handleCameraPhotoCaptured = async (data: {
    uri: string;
    captureSessionId: string | null;
    captureMethod: 'CAMERA';
    capturedAt: string;
  }) => {
    const now = new Date();
    const photoObj: CapturedPhoto = {
      id: 'photo-' + Date.now(),
      uri: data.uri,
      captureDate: now.toISOString().split('T')[0],
      captureTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      uploadDate: now.toISOString().split('T')[0],
      uploadTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      locationStatus: 'Captured using PikMoolya camera',
    };
    setConfirmedPhoto(photoObj);

    try {
      const base64 = await FileSystem.readAsStringAsync(data.uri, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
      await runAiQualityAssessment(base64, data.captureSessionId, 'CAMERA', data.capturedAt, null);
    } catch (err: any) {
      console.log('Error reading captured photo base64:', err?.message);
    }
  };

  // CERTIFICATE GENERATION & MANAGEMENT
  const generateQualityCertificate = async () => {
    try {
      setCertLoading(true);
      const payload = {
        cropName: selectedCrop?.name || 'Tomato',
        variety: selectedCrop?.variety || 'Fresh',
        quantity: Number(quantityToSell || 500),
        unit: qtyUnit,
        location: locationName || 'Pune, Maharashtra',
        qualityScore: Number(aiAssessment?.quality?.score || 86),
        qualityGrade: String(aiAssessment?.quality?.grade || 'A'),
        confidence: Number(aiAssessment?.quality?.confidence || 91),
        estimatedPrice: Number(expectedPrice || 33),
        priceRange: '₹31 - ₹35 / kg',
        assessmentData: aiAssessment || {},
        language: lang,
      };

      const res = await axios.post(`${API_URL}/certificates`, payload, { headers: authHeaders() });
      const certData = res.data?.certificate || res.data;
      setActiveCertificate(certData);
      navigateTo('certificate');
      Alert.alert('Certificate Generated', `Certificate ID: ${certData.certificateId}`);
    } catch (err: any) {
      Alert.alert('Certificate Error', getApiErrorMessage(err, 'Unable to generate certificate.'));
    } finally {
      setCertLoading(false);
    }
  };

  const loadMyCertificates = async () => {
    try {
      setCertLoading(true);
      const res = await axios.get(`${API_URL}/certificates/my`, { headers: authHeaders() });
      setMyCertificatesList(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.log('Load certificates error:', err?.message);
    } finally {
      setCertLoading(false);
    }
  };

  const handleDownloadPdf = async (certId: string, certNumber: string) => {
    try {
      const pdfUrl = `${API_URL}/certificates/${certId}/pdf`;
      const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
      const fileUri = `${docDir}${certNumber}.pdf`;

      const downloadRes = await FileSystem.downloadAsync(pdfUrl, fileUri);
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Quality Certificate',
          });
        } else {
          Alert.alert('PDF Downloaded', `Saved to ${downloadRes.uri}`);
        }
      } else {
        throw new Error('PDF download failed');
      }
    } catch (err: any) {
      Alert.alert('Download Error', 'Unable to download certificate PDF.');
    }
  };

  const verifyCertificateOnline = async (certificateId: string) => {
    try {
      setCertLoading(true);
      const res = await axios.get(`${API_URL}/certificates/verify/${certificateId}`);
      setVerificationData(res.data);
      navigateTo('verify');
    } catch (err: any) {
      Alert.alert('Verification Error', 'Unable to verify certificate.');
    } finally {
      setCertLoading(false);
    }
  };

  const publishFinalListing = async () => {
    if (!selectedCrop) {
      Alert.alert(t('selectCrop', lang), 'Please select what crop you are selling.');
      return;
    }
    if (!quantityToSell || Number(quantityToSell) <= 0) {
      Alert.alert(t('quantity', lang), 'Please enter quantity for sale.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        cropId: selectedCrop.id,
        quantity: Number(quantityToSell),
        totalAvailableQuantity: Number(totalAvailableQty || quantityToSell),
        unit: qtyUnit,
        expectedPrice: Number(expectedPrice || 33),
        locationApproximate: locationName || 'Pune district',
        visibleCondition: aiAssessment?.quality?.visibleCondition || 'Good',
        qualityDescription: aiAssessment?.quality?.grade ? `Grade ${aiAssessment.quality.grade} - AI Assessed` : 'Fresh Produce',
      };

      const createRes = await axios.post(`${API_URL}/produce`, payload, { headers: authHeaders() });
      const createdListing = createRes.data?.listing;

      if (createdListing?.id) {
        await axios.post(`${API_URL}/produce/${createdListing.id}/publish`, {}, { headers: authHeaders() });
      }

      Alert.alert('Success', 'Your produce is published now!');
      resetForm();
      await loadDashboard(token!);
      navigateTo('listing');
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error, 'Unable to publish produce.'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAddStep(1);
    setQuantityToSell('500');
    setExpectedPrice('33');
    setConfirmedPhoto(null);
    setAiAssessment(null);
  };

  // Market Selection Bottom Sheet Options
  const marketOptions: SelectionOption[] = (marketAnalysisData?.allMarkets || []).map((m: any) => ({
    id: m.marketName,
    label: m.marketName,
    subLabel: `${m.distanceKm} km from farm | Market Price: ₹${m.marketPricePerKg}/kg`,
    rightBadge: `₹${m.expectedNetSellingReturn?.toLocaleString('en-IN')} Net`,
    icon: 'location-outline',
    value: m,
  }));

  // REDESIGNED PROFESSIONAL AUTHENTICATION FLOW
  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* TOP HEADER WITH LANGUAGE & ACCOUNT DROPDOWNS */}
        <AppHeader
          currentLanguage={lang}
          onOpenLanguageModal={() => setLangModalVisible(true)}
          selectedAccount={selectedRole === 'LOGISTICS_PARTNER' ? 'Logistics' : selectedRole.toLowerCase()}
          onOpenAccountModal={() => setAccountModalVisible(true)}
          showAccountSelector={true}
        />

        {/* LIVE APMC MANDI TICKER (MATCHING WEBSITE HEADER) */}
        <LiveApmcTicker language={lang} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.authScrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* BRAND AREA WITH SPROUT BADGE (MATCHING WEBSITE LOGIN) */}
            <View style={styles.authBrandSection}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: '#DCFCE7',
                  borderWidth: 1,
                  borderColor: '#BBF7D0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name="leaf" size={28} color="#15803D" />
              </View>
              <PikMoolyaLogo size="medium" width={200} height={50} />
            </View>

            {/* AUTHENTICATION TITLES */}
            <View style={styles.authTitleSection}>
              <Text style={styles.authMainTitle}>
                {authMode === 'signin'
                  ? (lang === 'mr' ? 'आपल्या खात्यात साइन इन करा' : 'Sign in to your account')
                  : (lang === 'mr' ? 'नवीन खाते तयार करा' : 'Create your account')}
              </Text>
              <Text style={styles.authSubTitle}>
                {authMode === 'signin'
                  ? (lang === 'mr' ? 'थेट कृषी व्यापार, रास्त भाव शोध आणि वाहतूक व्यवस्थापन' : 'Access direct farm trading, fair pricing, and logistics')
                  : (lang === 'mr' ? 'पिकमूल्य मध्ये सामील व्हा आणि योग्य भाव व थेट बाजारपेठ मिळवा.' : 'Join PikMoolya and access fair prices and direct market opportunities.')}
              </Text>
            </View>

            {/* 1-CLICK QUICK DEMO LOGIN (EXACT WEBSITE MIRROR) */}
            {authMode === 'signin' && (
              <View style={styles.demoLoginBox}>
                <View style={styles.demoLoginHeaderRow}>
                  <Ionicons name="flash" size={13} color="#D97706" />
                  <Text style={styles.demoLoginHeader}>
                    {t('appName', lang)} • 1-CLICK DEMO LOGIN
                  </Text>
                </View>
                <View style={styles.demoLoginRow}>
                  <TouchableOpacity
                    style={[styles.demoBtn, styles.demoBtnFarmer]}
                    onPress={() => {
                      setPhone('+919876543210');
                      setPassword('Farmer@12345');
                      setSelectedRole('FARMER');
                      showToast(lang === 'mr' ? 'शेतकरी डेमो क्रेडेंशियल्स भरले (Ramesh Patil)' : 'Loaded Farmer demo credentials (Ramesh Patil)');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="leaf" size={13} color="#15803D" style={{ marginRight: 4 }} />
                    <Text style={styles.demoBtnTextFarmer}>{t('roleFarmer', lang) || t('farmer', lang)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoBtn, styles.demoBtnBuyer]}
                    onPress={() => {
                      setPhone('+919876543211');
                      setPassword('Buyer@12345');
                      setSelectedRole('BUYER');
                      showToast(lang === 'mr' ? 'खरेदीदार डेमो क्रेडेंशियल्स भरले (MahaAgro Traders)' : 'Loaded Buyer demo credentials (MahaAgro Traders)');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="business" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                    <Text style={styles.demoBtnTextBuyer}>{t('roleBuyer', lang) || t('buyer', lang)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoBtn, styles.demoBtnLogistics]}
                    onPress={() => {
                      setPhone('+919876543212');
                      setPassword('Logistics@12345');
                      setSelectedRole('LOGISTICS_PARTNER');
                      showToast(lang === 'mr' ? 'वाहतूकदार डेमो क्रेडेंशियल्स भरले' : 'Loaded Logistics Partner demo credentials');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bus" size={13} color="#D97706" style={{ marginRight: 4 }} />
                    <Text style={styles.demoBtnTextLogistics}>Logistics</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SEGMENTED SWITCH */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentTab,
                  authMode === 'signin' && styles.segmentTabActive,
                ]}
                onPress={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    authMode === 'signin' && styles.segmentTextActive,
                  ]}
                >
                  {t('signIn', lang)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentTab,
                  authMode === 'signup' && styles.segmentTabActive,
                ]}
                onPress={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    authMode === 'signup' && styles.segmentTextActive,
                  ]}
                >
                  {t('signUp', lang)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* FORM CONTAINER */}
            <View style={styles.authFormContainer}>
              {authSuccessMsg ? (
                <View style={styles.successMessageBox}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} style={{ marginRight: 6 }} />
                  <Text style={styles.successText}>{authSuccessMsg}</Text>
                </View>
              ) : null}

              {authMode === 'signin' ? (
                /* SIGN IN FORM */
                <View style={styles.fieldGap}>
                  <Text style={styles.fieldLabel}>{t('phoneNumber', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <View style={styles.countryPrefixBox}>
                      <Text style={styles.countryPrefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.fieldTextInput}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder={t('enterPhone', lang)}
                      keyboardType="phone-pad"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <Text style={styles.fieldLabel}>{t('password', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#64748B"
                      style={{ marginLeft: 12, marginRight: 6 }}
                    />
                    <TextInput
                      style={styles.fieldTextInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={t('enterPassword', lang)}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPassBtn}
                    onPress={() => Alert.alert(lang === 'mr' ? 'पासवर्ड विसरलात?' : 'Forgot Password', lang === 'mr' ? 'कृपया सपोर्टशी संपर्क साधा किंवा पासवर्ड रीसेट करा.' : 'Please contact support or reset password via OTP.')}
                  >
                    <Text style={styles.forgotPassText}>{lang === 'mr' ? 'पासवर्ड विसरलात?' : 'Forgot password?'}</Text>
                  </TouchableOpacity>

                  {authError ? (
                    <View style={styles.errorMessageBox}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.error} style={{ marginRight: 6 }} />
                      <Text style={styles.errorText}>{authError}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                    onPress={login}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                        <Text style={styles.mainSubmitText}>{lang === 'mr' ? 'साइन इन होत आहे...' : 'Signing in...'}</Text>
                      </View>
                    ) : (
                      <Text style={styles.mainSubmitText}>{t('signIn', lang)}</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchSub}>{t('dontHaveAccount', lang)} </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAuthMode('signup');
                        setAuthError('');
                        setAuthSuccessMsg('');
                      }}
                    >
                      <Text style={styles.switchLink}>{t('signUp', lang)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* SIGN UP FORM */
                <View style={styles.fieldGap}>
                  <Text style={styles.fieldLabel}>{t('fullName', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color="#64748B"
                      style={{ marginLeft: 12, marginRight: 6 }}
                    />
                    <TextInput
                      style={styles.fieldTextInput}
                      value={regName}
                      onChangeText={setRegName}
                      placeholder={t('enterFullName', lang)}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <Text style={styles.fieldLabel}>{t('phoneNumber', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <View style={styles.countryPrefixBox}>
                      <Text style={styles.countryPrefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.fieldTextInput}
                      value={regPhone}
                      onChangeText={setRegPhone}
                      placeholder={t('enterPhone', lang)}
                      keyboardType="phone-pad"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <Text style={styles.fieldLabel}>{t('password', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#64748B"
                      style={{ marginLeft: 12, marginRight: 6 }}
                    />
                    <TextInput
                      style={styles.fieldTextInput}
                      value={regPassword}
                      onChangeText={setRegPassword}
                      placeholder={t('enterPassword', lang)}
                      secureTextEntry={!showRegPassword}
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowRegPassword(!showRegPassword)}
                      style={styles.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>{t('confirmPassword', lang)}</Text>
                  <View style={styles.fieldInputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#64748B"
                      style={{ marginLeft: 12, marginRight: 6 }}
                    />
                    <TextInput
                      style={styles.fieldTextInput}
                      value={regConfirmPassword}
                      onChangeText={setRegConfirmPassword}
                      placeholder={t('enterConfirmPassword', lang)}
                      secureTextEntry={!showRegPassword}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  {authError ? (
                    <View style={styles.errorMessageBox}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.error} style={{ marginRight: 6 }} />
                      <Text style={styles.errorText}>{authError}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.mainSubmitBtn, loading && styles.btnDisabled]}
                    onPress={register}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                        <Text style={styles.mainSubmitText}>{lang === 'mr' ? 'खाते तयार होत आहे...' : 'Creating account...'}</Text>
                      </View>
                    ) : (
                      <Text style={styles.mainSubmitText}>{t('createAccount', lang)}</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchSub}>{t('alreadyHaveAccount', lang)} </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAuthMode('signin');
                        setAuthError('');
                        setAuthSuccessMsg('');
                      }}
                    >
                      <Text style={styles.switchLink}>{t('signIn', lang)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* SUBTLE FOOTNOTE */}
            <View style={styles.authFootnote}>
              <Text style={styles.authFootnoteText}>
                {t('tagline', lang)}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* MODAL BOTTOM SHEETS */}
        <LanguageSelectorModal
          visible={langModalVisible}
          currentLanguage={lang}
          onSelectLanguage={(newLang) => changeLanguageHandler(newLang)}
          onClose={() => setLangModalVisible(false)}
        />

        <AccountSelectorModal
          visible={accountModalVisible}
          selectedRole={selectedRole === 'LOGISTICS_PARTNER' ? 'logistics' : (selectedRole.toLowerCase() as AccountType)}
          onSelectRole={(role) => {
            const mappedRole: UserRole = role === 'logistics' ? 'LOGISTICS_PARTNER' : (role.toUpperCase() as UserRole);
            setSelectedRole(mappedRole);
          }}
          onClose={() => setAccountModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* App Top Header Bar */}
      <AppHeader
        currentLanguage={lang}
        onOpenLanguageModal={() => setLangModalVisible(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationModalVisible(true)}
      />

      {/* LIVE APMC MANDI BENCHMARK TICKER (MATCHING WEBSITE) */}
      <LiveApmcTicker language={lang} />

      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mainBody}>

        {/* ==================== 1. FARMER DASHBOARD & VIEWS ==================== */}
        {userRole === 'FARMER' && (
          <>
            {/* FARMER HOME SCREEN */}
            {screen === 'home' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* HERO PLATFORM BANNER (MATCHING WEBSITE HOME HERO) */}
                <View style={styles.homeHeroBanner}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="sparkles" size={13} color="#15803D" />
                    <Text style={styles.heroBadgeText}>
                      {lang === 'mr' ? 'पुढील पिढीचे कृषी व्यापार व्यासपीठ' : 'Next-Gen Agri Commerce Platform'}
                    </Text>
                  </View>
                  <Text style={styles.heroMainTitle}>
                    {lang === 'mr' ? 'शेतकऱ्यांसाठी रास्त भाव.\nखरेदीदारांसाठी थेट बाजारपेठ.' : 'Fair Prices for Farmers.\nDirect Market Access for Buyers.'}
                  </Text>
                  <Text style={styles.heroSubText}>
                    {lang === 'mr'
                      ? 'पिकमूल्य शास्त्रीय बहु-घटक AI किंमत शोध, संगणक दृष्टी आधारित गुणवत्ता मूल्यांकन आणि थेट दलालमुक्त खरेदी-विक्रीद्वारे कृषी व्यापारात संपूर्ण पारदर्शकता आणते.'
                      : 'PikMoolya solves agricultural price asymmetry through scientific multi-factor AI price discovery, computer vision crop quality certification, and direct middleman-free trade.'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                    <TouchableOpacity
                      style={[styles.primaryButton, { flex: 1, paddingVertical: 10 }]}
                      onPress={() => { resetForm(); navigateTo('add'); }}
                    >
                      <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.primaryBtnText}>{t('sellProduce', lang)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.outlineButton, { flex: 1, paddingVertical: 10 }]}
                      onPress={handleOpenRealCamera}
                    >
                      <Ionicons name="camera" size={16} color="#15803D" style={{ marginRight: 4 }} />
                      <Text style={styles.outlineBtnText}>{t('checkQuality', lang)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 STAT METRICS HIGHLIGHTS (2x2 GRID MATCHING WEBSITE 4 METRICS) */}
                <View style={styles.statsGrid2x2}>
                  <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                      <Text style={[styles.statNumber, { color: '#166534' }]}>₹0</Text>
                      <Text style={styles.statLabel}>
                        {lang === 'mr' ? 'मध्यस्थ किंवा दलाली शुल्क' : 'Middleman Brokerage Fees'}
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={[styles.statNumber, { color: '#2563EB' }]}>46+</Text>
                      <Text style={styles.statLabel}>
                        {lang === 'mr' ? 'पिके व वाणांचे आधारभूत दर' : 'Crops & Varietal Benchmarks'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                      <Text style={[styles.statNumber, { color: '#D97706' }]}>Grade A/B/C</Text>
                      <Text style={styles.statLabel}>
                        {lang === 'mr' ? 'संगणक दृष्टी गुणवत्ता मूल्यांकन' : 'Computer Vision Quality Proof'}
                      </Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={[styles.statNumber, { color: '#16A34A' }]}>100%</Text>
                      <Text style={styles.statLabel}>
                        {lang === 'mr' ? 'सुरक्षित थेट व्यवहार पूर्तता' : 'Direct Trade Settlement'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* INTERACTIVE QUICK FAIR PRICE ESTIMATOR (MATCHING WEBSITE CALCULATOR PREVIEW) */}
                <View style={styles.quickCalcCard}>
                  <View style={styles.quickCalcHeader}>
                    <Ionicons name="scale-outline" size={20} color="#15803D" />
                    <Text style={styles.quickCalcTitle}>
                      {lang === 'mr' ? 'थेट रास्त भाव गणक पूर्वावलोकन' : 'Interactive Fair Price Calculator Preview'}
                    </Text>
                  </View>
                  <Text style={styles.quickCalcSub}>
                    {lang === 'mr'
                      ? 'तुमच्या शेतमालाची नोंदणी करण्यापूर्वी थेट वैज्ञानिक किंमत शोध प्रणालीचा अनुभव घ्या:'
                      : 'Experience the scientific pricing formula live before registering your produce listing:'}
                  </Text>

                  {/* Crop Selection Pills */}
                  <View style={styles.calcCropPillsRow}>
                    {[
                      { key: 'Wheat', label: lang === 'mr' ? '🌾 गहू' : '🌾 Wheat' },
                      { key: 'Rice', label: lang === 'mr' ? '🍚 तांदूळ' : '🍚 Rice' },
                      { key: 'Soybean', label: lang === 'mr' ? '🌱 सोयाबीन' : '🌱 Soybean' },
                      { key: 'Gram', label: lang === 'mr' ? '🌿 हरभरा' : '🌿 Gram' },
                    ].map((c) => (
                      <TouchableOpacity
                        key={c.key}
                        style={[styles.calcCropPill, quickCrop === c.key && styles.calcCropPillActive]}
                        onPress={() => setQuickCrop(c.key)}
                      >
                        <Text style={[styles.calcCropPillText, quickCrop === c.key && styles.calcCropPillTextActive]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Quantity Stepper Selector */}
                  <View style={styles.calcQtyRow}>
                    <Text style={styles.calcQtyLabel}>
                      {lang === 'mr' ? `प्रमाण: ${quickQty} क्विंटल` : `Quantity: ${quickQty} Quintals`}
                    </Text>
                    <View style={styles.calcQtyPills}>
                      {[25, 50, 100, 150].map((q) => (
                        <TouchableOpacity
                          key={q}
                          style={[styles.calcQtyBtn, quickQty === q && styles.calcQtyBtnActive]}
                          onPress={() => setQuickQty(q)}
                        >
                          <Text style={[styles.calcQtyBtnText, quickQty === q && styles.calcQtyBtnTextActive]}>
                            {q} q
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Calculation Result */}
                  <View style={styles.calcResultBox}>
                    <Text style={styles.calcResultLabel}>
                      {lang === 'mr' ? 'AI रास्त मूल्य अंदाज' : 'AI FAIR VALUE ESTIMATE'}
                    </Text>
                    <Text style={styles.calcResultAmount}>
                      ₹{quickGross.toLocaleString('en-IN')}{' '}
                      <Text style={styles.calcResultRate}>(₹{quickEstPrice}/q)</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, { paddingVertical: 10 }]}
                    onPress={() => {
                      setSelectedCrop(crops[0] || MAHARASHTRA_CROP_CATALOG[0]);
                      navigateTo('price');
                    }}
                  >
                    <Ionicons name="analytics-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>
                      {lang === 'mr' ? '५-घटक रास्त भाव शोध' : 'Full 5-Factor Price Discovery'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3 CORE ARCHITECTURAL PILLARS (MATCHING WEBSITE PILLARS) */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.sectionHeader}>
                    {lang === 'mr' ? 'पिकमूल्य मुख्य आधारस्तंभ' : 'Core Architectural Pillars'}
                  </Text>
                  <View style={styles.pillarCard}>
                    <View style={[styles.pillarIconBox, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="trending-up" size={18} color="#15803D" />
                    </View>
                    <Text style={styles.pillarTitle}>
                      {lang === 'mr' ? 'वैज्ञानिक रास्त भाव शोध' : 'Scientific Fair Price Discovery'}
                    </Text>
                    <Text style={styles.pillarDesc}>
                      {lang === 'mr'
                        ? 'पिकाचा वाण, काढणीची तारीख, अंतर, APMC ऐतिहासिक आकडेवारी आणि पुरवठा-मागणीवर आधारित रास्त भाव निश्चिती.'
                        : 'Empirical price estimation calculating fair benchmarks based on crop variety, harvest date, location proximity, APMC historical data, and live supply demand tension.'}
                    </Text>
                  </View>

                  <View style={styles.pillarCard}>
                    <View style={[styles.pillarIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="ribbon-outline" size={18} color="#2563EB" />
                    </View>
                    <Text style={styles.pillarTitle}>
                      {lang === 'mr' ? 'संगणक दृष्टी गुणवत्ता श्रेणीकरण' : 'Computer Vision Quality Grading'}
                    </Text>
                    <Text style={styles.pillarDesc}>
                      {lang === 'mr'
                        ? 'शेतकरी स्मार्टफोनने फोटो काढतात. AI मॉडेल दाण्यांचा आकार, रंग आणि गुणवत्तेचे विश्लेषण करून Grade A/B/C प्रमाणपत्र तयार करते.'
                        : 'Farmers photograph produce with a smartphone camera. Fast image feature analysis evaluates grain uniformity, surface discoloration, vibrancy, and generates Grade A/B/C proofs.'}
                    </Text>
                  </View>

                  <View style={styles.pillarCard}>
                    <View style={[styles.pillarIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#D97706" />
                    </View>
                    <Text style={styles.pillarTitle}>
                      {lang === 'mr' ? 'थेट पारदर्शक कृषी व्यापार' : 'Direct Transparent Trade'}
                    </Text>
                    <Text style={styles.pillarDesc}>
                      {lang === 'mr'
                        ? 'दलालांच्या मक्तेदारीऐवजी पारदर्शक अल्गोरिदम आणि थेट पडताळणीयोग्य व्यापार व सुरक्षित व्यवहार.'
                        : 'Direct farmer-buyer negotiation engine with binding counteroffers, escrow protection, and direct transport booking.'}
                    </Text>
                  </View>
                </View>

                {/* MARKET PRICE CARD WITH CROP & MARKET DISPLAYED */}
                <View style={styles.fairPriceCard}>
                  <View style={styles.priceRowHeader}>
                    <Text style={styles.priceCardLabel}>TODAY'S MARKET PRICE | {selectedCrop?.name || 'Tomato'}</Text>
                    <View style={styles.badgeGreenLight}>
                      <Text style={styles.badgeTextGreen}>Pune APMC</Text>
                    </View>
                  </View>

                  <Text style={styles.priceAmount}>₹32 <Text style={styles.priceUnit}>/ kg</Text></Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Crop: {selectedCrop?.name || 'Tomato'} | Market: Pune APMC</Text>

                  <TouchableOpacity
                    style={styles.priceActionBtn}
                    onPress={() => {
                      setSelectedCrop(crops[0] || MAHARASHTRA_CROP_CATALOG[0]);
                      navigateTo('price');
                    }}
                  >
                    <Ionicons name="analytics-outline" size={16} color="#15803D" style={{ marginRight: 6 }} />
                    <Text style={styles.priceActionBtnText}>Calculate Best Market & Net Return</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>{t('quickActions', lang)}</Text>
                <View style={styles.actionGrid}>
                  <TouchableOpacity style={styles.quickActionCard} onPress={() => { resetForm(); navigateTo('add'); }}>
                    <View style={styles.actionIconBox}>
                      <Ionicons name="add-circle-outline" size={24} color="#15803D" />
                    </View>
                    <Text style={styles.quickActionTitle}>{t('sellProduce', lang)}</Text>
                    <Text style={styles.quickActionSub}>{t('addProduce', lang)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionCard} onPress={handleOpenRealCamera}>
                    <View style={styles.actionIconBox}>
                      <Ionicons name="camera-outline" size={24} color="#15803D" />
                    </View>
                    <Text style={styles.quickActionTitle}>{t('checkQuality', lang)}</Text>
                    <Text style={styles.quickActionSub}>{t('takePhoto', lang)}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="leaf-outline" size={20} color="#15803D" style={{ marginRight: 6 }} />
                      <Text style={styles.cardTitle}>{t('myProducts', lang)}</Text>
                    </View>
                    <View style={styles.badgeGreenLight}>
                      <Text style={styles.badgeTextGreen}>{listings.length} {t('active', lang)}</Text>
                    </View>
                  </View>

                  {listings.length > 0 ? (
                    <View style={styles.miniProductRow}>
                      <Text style={styles.miniProductName}>{listings[0]?.crop?.name || 'Tomato'}</Text>
                      <Text style={styles.miniProductQty}>{listings[0]?.quantity || 500} {listings[0]?.unit || 'kg'}</Text>
                    </View>
                  ) : (
                    <Text style={styles.cardSubText}>No active listings found.</Text>
                  )}

                  <TouchableOpacity style={styles.outlineButton} onPress={() => navigateTo('listing')}>
                    <Text style={styles.outlineBtnText}>{t('products', lang)}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* AUTOMATIC NET SELLING RETURN & MARKET OPTIMIZATION SCREEN ('price') */}
            {screen === 'price' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backLink} onPress={() => navigateTo('home')}>
                  <Ionicons name="arrow-back" size={18} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.backLinkText}>{t('home', lang)}</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>Market Return Analysis</Text>
                <Text style={styles.greetingSub}>
                  PikMoolya automatically analyzes nearby markets, calculates transportation costs, and recommends where you will receive the highest net return after transport.
                </Text>

                {/* MINIMAL FARMER INPUT CARD */}
                <View style={[styles.card, { marginTop: 12 }]}>
                  <Text style={styles.cardTitle}>Your Produce Information</Text>

                  {/* Crop Picker Dropdown Button */}
                  <Text style={styles.inputLabel}>Crop</Text>
                  <TouchableOpacity style={styles.dropdownBtn} onPress={() => setCropDropdownOpen(true)}>
                    <Text style={styles.dropdownBtnText}>{selectedCropLabel}</Text>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>

                  {/* Quantity & Unit Row */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.inputLabel}>Quantity</Text>
                      <TextInput
                        style={styles.input}
                        value={quantityToSell}
                        onChangeText={setQuantityToSell}
                        keyboardType="numeric"
                        placeholder="e.g. 500"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Unit</Text>
                      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setUnitModalVisible(true)}>
                        <Text style={styles.dropdownBtnText}>{qtyUnit}</Text>
                        <Ionicons name="chevron-down" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Location Picker Dropdown Button */}
                  <Text style={styles.inputLabel}>Farm Location</Text>
                  <TouchableOpacity style={styles.dropdownBtn} onPress={() => setLocationModalVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location-outline" size={18} color="#15803D" style={{ marginRight: 6 }} />
                      <Text style={styles.dropdownBtnText}>{locationName}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* ANALYSIS RESULT */}
                {marketAnalysisLoading ? (
                  <View style={styles.card}>
                    <ActivityIndicator color="#15803D" size="large" style={{ marginVertical: 24 }} />
                    <Text style={{ textAlign: 'center', color: '#64748B', fontWeight: '600' }}>Finding nearby markets & calculating transport...</Text>
                  </View>
                ) : marketAnalysisData ? (
                  <>
                    {/* 1. TOP RECOMMENDED MARKET FOR BEST EXPECTED NET SELLING RETURN */}
                    <View style={styles.bestMarketCard}>
                      <View style={styles.bestMarketHeader}>
                        <Ionicons name="star" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.bestMarketHeaderText}>BEST EXPECTED RETURN</Text>
                      </View>

                      <View style={{ padding: 16 }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={() => setMarketModalVisible(true)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bestMarketName}>{marketAnalysisData.recommendedMarket?.marketName}</Text>
                            <Text style={styles.bestMarketDist}>{marketAnalysisData.recommendedMarket?.distanceKm} km from your farm</Text>
                          </View>
                          <Ionicons name="chevron-down-circle-outline" size={24} color="#15803D" />
                        </TouchableOpacity>

                        <View style={styles.certDivider} />

                        <View style={styles.analysisMetricsRow}>
                          <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Market Price</Text>
                            <Text style={styles.metricVal}>₹{marketAnalysisData.recommendedMarket?.marketPricePerKg}/kg</Text>
                          </View>

                          <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Gross Value</Text>
                            <Text style={styles.metricVal}>₹{marketAnalysisData.recommendedMarket?.grossSellingValue?.toLocaleString('en-IN')}</Text>
                          </View>

                          <View style={styles.metricBox}>
                            <Text style={styles.metricLabel}>Est. Transport</Text>
                            <Text style={[styles.metricVal, { color: '#C53030' }]}>-₹{marketAnalysisData.recommendedMarket?.transportCost?.toLocaleString('en-IN')}</Text>
                          </View>
                        </View>

                        <View style={styles.profitBadgeBox}>
                          <Text style={styles.profitBadgeText}>
                            EXPECTED NET SELLING RETURN: ₹{marketAnalysisData.recommendedMarket?.expectedNetSellingReturn?.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.whyBox}>
                          <Text style={styles.whyTitle}>Why this market?</Text>
                          <Text style={styles.whyText}>{marketAnalysisData.recommendedMarket?.whyRecommended}</Text>
                        </View>
                      </View>
                    </View>

                    {/* 2. THREE SEPARATE PRICING CONCEPTS (ALWAYS SHOW CROP & MARKET) */}
                    <Text style={styles.sectionHeader}>Price Evidence & Recommendation</Text>
                    <View style={styles.priceEvidenceRow}>
                      <View style={styles.priceEvidenceCard}>
                        <Text style={styles.priceEvidenceTitle}>TODAY'S MARKET PRICE</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>{selectedCrop?.name || 'Tomato'}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B' }}>{marketAnalysisData.pricingMetrics?.marketName || 'Pune APMC'}</Text>
                        <Text style={styles.priceEvidenceValue}>{marketAnalysisData.pricingMetrics?.todayMarketPrice}</Text>
                        <Text style={styles.priceEvidenceSub}>Market Reference Data</Text>
                      </View>

                      <View style={styles.priceEvidenceCard}>
                        <Text style={styles.priceEvidenceTitle}>AI FAIR PRICE</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D', marginTop: 2 }}>PikMoolya AI</Text>
                        <Text style={styles.priceEvidenceValue}>{marketAnalysisData.pricingMetrics?.aiFairPriceRange}</Text>
                        <Text style={styles.priceEvidenceSub}>Grade {aiAssessment?.quality?.grade || 'A'} Assessed</Text>
                      </View>

                      <View style={[styles.priceEvidenceCard, { borderColor: '#15803D', backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.priceEvidenceTitle, { color: '#15803D' }]}>RECOMMENDED</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D', marginTop: 2 }}>Asking Price</Text>
                        <Text style={[styles.priceEvidenceValue, { color: '#15803D' }]}>{marketAnalysisData.pricingMetrics?.recommendedAskingPrice}</Text>
                        <Text style={styles.priceEvidenceSub}>Target asking price</Text>
                      </View>
                    </View>

                    {/* 3. COMPARE ALL NEARBY MARKETS */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <Text style={styles.sectionHeader}>Nearby Market Comparison</Text>
                      <TouchableOpacity style={styles.dropdownPill} onPress={() => setMarketModalVisible(true)}>
                        <Text style={styles.dropdownPillText}>Select Market</Text>
                        <Ionicons name="chevron-down" size={14} color="#15803D" />
                      </TouchableOpacity>
                    </View>

                    {marketAnalysisData.allMarkets?.map((m: any, idx: number) => (
                      <View key={m.marketName || idx} style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                          <View>
                            <Text style={styles.productName}>{m.marketName}</Text>
                            <Text style={styles.productQty}>{m.distanceKm} km from farm | {m.vehicleRecommended}</Text>
                          </View>
                          {idx === 0 && (
                            <View style={styles.badgeGreenLight}>
                              <Text style={styles.badgeTextGreen}>Best Net Return</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.certDivider} />

                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLabel}>Market Price:</Text>
                          <Text style={styles.reviewVal}>₹{m.marketPricePerKg}/kg</Text>
                        </View>

                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLabel}>Gross Selling Value:</Text>
                          <Text style={styles.reviewVal}>₹{m.grossSellingValue?.toLocaleString('en-IN')}</Text>
                        </View>

                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLabel}>Estimated Transport:</Text>
                          <Text style={[styles.reviewVal, { color: '#C53030' }]}>-₹{m.transportCost?.toLocaleString('en-IN')}</Text>
                        </View>

                        <View style={styles.reviewRow}>
                          <Text style={styles.reviewLabel}>Expected Net Selling Return:</Text>
                          <Text style={[styles.reviewVal, { color: '#15803D', fontWeight: '700' }]}>₹{m.expectedNetSellingReturn?.toLocaleString('en-IN')}</Text>
                        </View>
                      </View>
                    ))}

                    {/* 4. EXPANDABLE "HOW DID PIKMOOLYA CALCULATE THIS?" */}
                    <TouchableOpacity
                      style={styles.expandCalcBtn}
                      onPress={() => setShowHowCalculated(!showHowCalculated)}
                    >
                      <Text style={styles.expandCalcBtnText}>How did PikMoolya calculate this?</Text>
                      <Ionicons name={showHowCalculated ? 'chevron-up' : 'chevron-down'} size={18} color="#15803D" />
                    </TouchableOpacity>

                    {showHowCalculated && marketAnalysisData.topChoiceCalculationBreakdown ? (
                      <View style={styles.calcBreakdownCard}>
                        <Text style={styles.calcBreakdownTitle}>Step-by-Step Return Calculation</Text>
                        
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Crop:</Text>
                          <Text style={styles.calcVal}>{marketAnalysisData.topChoiceCalculationBreakdown.crop}</Text>
                        </View>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Market Price:</Text>
                          <Text style={styles.calcVal}>{marketAnalysisData.topChoiceCalculationBreakdown.marketPrice}</Text>
                        </View>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Quantity:</Text>
                          <Text style={styles.calcVal}>{marketAnalysisData.topChoiceCalculationBreakdown.quantity}</Text>
                        </View>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Gross Selling Value:</Text>
                          <Text style={styles.calcVal}>{marketAnalysisData.topChoiceCalculationBreakdown.grossSellingValue}</Text>
                        </View>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Estimated Transportation:</Text>
                          <Text style={[styles.calcVal, { color: '#C53030' }]}>{marketAnalysisData.topChoiceCalculationBreakdown.estimatedTransport}</Text>
                        </View>

                        <View style={styles.certDivider} />

                        <View style={styles.calcRow}>
                          <Text style={[styles.calcLabel, { fontWeight: '700', fontSize: 14 }]}>Expected Net Selling Return:</Text>
                          <Text style={[styles.calcVal, { fontWeight: '700', fontSize: 15, color: '#15803D' }]}>
                            {marketAnalysisData.topChoiceCalculationBreakdown.expectedNetSellingReturn}
                          </Text>
                        </View>

                        <Text style={styles.calcNoteText}>{marketAnalysisData.topChoiceCalculationBreakdown.note}</Text>
                      </View>
                    ) : null}

                    {/* CONTINUE ACTION BUTTON */}
                    <TouchableOpacity
                      style={[styles.primaryButton, { marginVertical: 18 }]}
                      onPress={() => {
                        setAddStep(1);
                        navigateTo('add');
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Continue With Recommended Market</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </ScrollView>
            )}

            {/* PRODUCE FORM (ADD PRODUCE 13-STEP PROCESS) */}
            {screen === 'add' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.wizardHeader}>
                  <Text style={styles.wizardStepText}>
                    Step {addStep} of 13 | {
                      addStep <= 2 ? 'Produce & Quantity' :
                      addStep <= 7 ? 'Location Details' :
                      addStep <= 9 ? 'Photo & AI Quality' :
                      addStep <= 11 ? 'Market Optimization' : 'Review & Publish'
                    }
                  </Text>
                  <Text style={styles.wizardTitle}>{t('addProduce', lang)}</Text>
                </View>

                {/* PROGRESS SUMMARY PILLS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {['1 Crop', '2 Qty', '3 Unit', '4 District', '5 Taluka', '6 Village', '7 Location', '8 Photo', '9 Quality', '10 Market', '11 Best Market', '12 Review', '13 Publish'].map((st, i) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.dropdownPill,
                          addStep === i + 1 && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                          addStep > i + 1 && { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                        ]}
                        onPress={() => {
                          if (i + 1 <= addStep) setAddStep(i + 1);
                        }}
                      >
                        <Text style={[styles.dropdownPillText, addStep === i + 1 && { color: '#FFFFFF' }, addStep > i + 1 && { color: '#166534' }]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* STEP 1: CROP */}
                {addStep === 1 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 1: Select Crop</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setCropDropdownOpen(true)}>
                      <Text style={styles.dropdownBtnText}>{selectedCrop?.name || 'Select Crop'}</Text>
                      <Ionicons name="chevron-down-outline" size={18} color="#718096" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* STEP 2: QUANTITY */}
                {addStep === 2 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 2: Enter Available Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={quantityToSell}
                      onChangeText={(val) => { setQuantityToSell(val); setTotalAvailableQty(val); }}
                    />
                  </View>
                ) : null}

                {/* STEP 3: UNIT */}
                {addStep === 3 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 3: Select Measurement Unit</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setUnitModalVisible(true)}>
                      <Text style={styles.dropdownBtnText}>{qtyUnit || 'kg'}</Text>
                      <Ionicons name="chevron-down-outline" size={18} color="#718096" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* STEP 4: DISTRICT */}
                {addStep === 4 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 4: Select District</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setLocationModalVisible(true)}>
                      <Text style={styles.dropdownBtnText}>{locationName || 'Pune'}</Text>
                      <Ionicons name="chevron-down-outline" size={18} color="#718096" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* STEP 5: TALUKA */}
                {addStep === 5 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 5: Select Taluka</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setLocationModalVisible(true)}>
                      <Text style={styles.dropdownBtnText}>Haveli Taluka</Text>
                      <Ionicons name="chevron-down-outline" size={18} color="#718096" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* STEP 6: VILLAGE */}
                {addStep === 6 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 6: Select Village</Text>
                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setLocationModalVisible(true)}>
                      <Text style={styles.dropdownBtnText}>Khed Village</Text>
                      <Ionicons name="chevron-down-outline" size={18} color="#718096" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* STEP 7: FARM LOCATION */}
                {addStep === 7 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 7: Farm Pickup Location</Text>
                    <TextInput
                      style={styles.input}
                      value={locationName}
                      onChangeText={setLocationName}
                      placeholder="Enter farm address or landmark"
                    />
                  </View>
                ) : null}

                {/* STEP 8: PHOTO */}
                {addStep === 8 ? (
                  <View style={styles.card}>
                    <Text style={styles.inputLabel}>Step 8: Product Photo</Text>
                    <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                      <TouchableOpacity style={[styles.secondaryButton, { flex: 1, marginRight: 6 }]} onPress={handleOpenRealCamera}>
                        <Ionicons name="camera-outline" size={20} color="#15803D" style={{ marginRight: 6 }} />
                        <Text style={styles.secondaryBtnText}>{t('takePhoto', lang)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.secondaryButton, { flex: 1, marginLeft: 6 }]} onPress={handleOpenGallery}>
                        <Ionicons name="image-outline" size={20} color="#15803D" style={{ marginRight: 6 }} />
                        <Text style={styles.secondaryBtnText}>{t('chooseFromGallery', lang)}</Text>
                      </TouchableOpacity>
                    </View>

                    {confirmedPhoto ? (
                      <View style={styles.photoAttachedBox}>
                        <Image source={{ uri: confirmedPhoto.uri }} style={styles.photoThumbnail} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.photoTitle}>Photo Attached </Text>
                          <Text style={styles.photoMeta}>{confirmedPhoto.locationStatus}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* STEP 9: AI QUALITY */}
                {addStep === 9 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Step 9: AI Quality Assessment</Text>
                    {qualityLoading ? (
                      <ActivityIndicator color="#15803D" size="large" style={{ marginVertical: 20 }} />
                    ) : (
                      <View style={styles.qualityScoreRow}>
                        <View style={styles.scoreCircle}>
                          <Text style={styles.scoreNumber}>{aiAssessment?.quality?.score || 86}</Text>
                          <Text style={styles.scoreMax}>/ 100</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.gradeTitle}>Grade {aiAssessment?.quality?.grade || 'A'}</Text>
                          <Text style={styles.gradeSub}>{aiAssessment?.quality?.visibleCondition || 'Fresh Harvest'}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ) : null}

                {/* STEP 10: MARKET ANALYSIS */}
                {addStep === 10 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Step 10: Market Analysis</Text>
                    <Text style={styles.greetingSub}>Calculating today's APMC prices and transport costs...</Text>
                    <View style={[styles.profitBadgeBox, { marginTop: 12 }]}>
                      <Text style={styles.profitBadgeText}>Today's Market Reference: ₹32/kg</Text>
                    </View>
                  </View>
                ) : null}

                {/* STEP 11: BEST MARKET */}
                {addStep === 11 ? (
                  <View style={styles.bestMarketCard}>
                    <View style={styles.bestMarketHeader}>
                      <Ionicons name="star" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.bestMarketHeaderText}>Step 11: Best Market Identified</Text>
                    </View>
                    <View style={{ padding: 14 }}>
                      <Text style={styles.bestMarketName}>Pune APMC Market</Text>
                      <Text style={styles.bestMarketDist}>25 km from farm | Recommended Asking Price: ₹35/kg</Text>
                    </View>
                  </View>
                ) : null}

                {/* STEP 12: REVIEW */}
                {addStep === 12 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Step 12: Review Details</Text>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Crop:</Text>
                      <Text style={styles.reviewVal}>{selectedCrop?.name || 'Tomato'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Quantity:</Text>
                      <Text style={styles.reviewVal}>{quantityToSell} {qtyUnit}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Location:</Text>
                      <Text style={styles.reviewVal}>{locationName}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Asking Price:</Text>
                      <Text style={styles.reviewVal}>₹{expectedPrice}/{qtyUnit}</Text>
                    </View>
                  </View>
                ) : null}

                {/* STEP 13: PUBLISH */}
                {addStep === 13 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Step 13: Create Product Listing</Text>
                    <Text style={styles.greetingSub}>Publish your produce to direct verified buyers on PikMoolya.</Text>
                    <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={publishFinalListing} disabled={loading}>
                      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>{t('publish', lang)} Listing</Text>}
                    </TouchableOpacity>

                    <View style={{ gap: 8, marginTop: 12 }}>
                      <TouchableOpacity style={styles.outlineButton} onPress={() => navigateTo('listing')}>
                        <Text style={styles.outlineBtnText}>View My Products</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.outlineButton} onPress={() => navigateTo('price')}>
                        <Text style={styles.outlineBtnText}>View Market Recommendation</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {/* WIZARD NAVIGATION BUTTONS */}
                <View style={styles.wizardNav}>
                  {addStep > 1 ? (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => setAddStep(addStep - 1)}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </TouchableOpacity>
                  ) : <View />}

                  {addStep < 13 ? (
                    <TouchableOpacity
                      style={styles.primaryButtonSmall}
                      onPress={() => {
                        const stepMsgs: Record<number, string> = {
                          1: 'Crop selected.',
                          2: 'Quantity saved.',
                          3: 'Unit selected.',
                          4: 'District selected.',
                          5: 'Taluka selected.',
                          6: 'Village selected.',
                          7: 'Farm location selected.',
                          8: 'Product photo analyzed.',
                          9: 'AI quality assessment completed.',
                          10: 'Market prices checked.',
                          11: 'Best market identified.',
                          12: 'Listing reviewed.',
                        };
                        const msg = stepMsgs[addStep] || `Step ${addStep} completed.`;
                        showToast(msg);
                        setAddStep(addStep + 1);
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Next</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </ScrollView>
            )}

            {/* FARMER PRODUCTS TAB */}
            {screen === 'listing' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.screenHeaderRow}>
                  <Text style={styles.sectionHeader}>{t('myProducts', lang)}</Text>
                  <TouchableOpacity style={styles.primaryButtonSmall} onPress={() => navigateTo('add')}>
                    <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.primaryBtnText}>List Produce</Text>
                  </TouchableOpacity>
                </View>

                {listings.length === 0 ? (
                  <EmptyState
                    title="No produce listed yet"
                    description="List your first agricultural produce and let verified buyers discover it."
                    icon="leaf-outline"
                    actionLabel="List Produce"
                    onAction={() => navigateTo('add')}
                  />
                ) : (
                  listings.map((item, idx) => {
                    const cName = item.crop?.name || 'Produce';
                    const imgSrc = getCropImage(cName, item.photoUri || item.imageUrl);
                    const qtyVal = Number(item.quantity || item.totalAvailableQuantity || 500);
                    const unitVal = item.unit || 'kg';
                    const priceVal = Number(item.expectedPrice || item.priceFloor || 32);
                    const aiFairVal = Math.round(priceVal * 1.05);
                    const fillPct = Math.min(100, Math.max(20, (qtyVal / 500) * 100));

                    return (
                      <View key={getListingId(item) || idx} style={styles.mobileProductCard}>
                        {/* Image Header */}
                        <View style={styles.cardImageWrapper}>
                          <Image source={{ uri: imgSrc }} style={styles.cardImage} resizeMode="cover" />
                          <View style={styles.cardCategoryBadge}>
                            <Text style={styles.cardCategoryText}>{item.crop?.variety || (lang === 'mr' ? 'शेतमाल' : 'Produce')}</Text>
                          </View>
                          <View style={styles.cardGradeBadge}>
                            <Ionicons name="ribbon" size={13} color="#15803D" />
                            <Text style={styles.cardGradeText}>Grade A</Text>
                            <Text style={styles.cardGradeSub}>(88/100)</Text>
                          </View>
                        </View>

                        {/* Content Body */}
                        <View style={styles.cardContent}>
                          <View style={styles.cardTitleRow}>
                            <Text style={styles.cardCropTitle}>{cName}</Text>
                            <StatusBadge status={item.status || 'Active'} />
                          </View>

                          <View style={styles.cardLocationRow}>
                            <Ionicons name="location-outline" size={13} color="#64748B" />
                            <Text style={styles.cardLocationText}>
                              {item.locationName || item.locationApproximate || 'Pune APMC Mandi'}
                            </Text>
                          </View>

                          {/* Price Box */}
                          <View style={styles.cardPriceBox}>
                            <View style={styles.cardPriceRow}>
                              <View>
                                <Text style={styles.priceAskLabel}>{lang === 'mr' ? 'शेतकऱ्याचा भाव' : 'Seller Asking'}</Text>
                                <Text style={styles.priceAskValue}>
                                  ₹{priceVal.toLocaleString('en-IN')}{' '}
                                  <Text style={styles.priceAskUnit}>/{unitVal}</Text>
                                </Text>
                              </View>
                              <View style={styles.aiFairPill}>
                                <Ionicons name="trending-up" size={12} color="#15803D" />
                                <Text style={styles.aiFairText}>
                                  {lang === 'mr' ? 'AI रास्त:' : 'AI Fair:'} ₹{aiFairVal}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Stock Availability */}
                          <View style={styles.stockBarContainer}>
                            <View style={styles.stockBarLabelRow}>
                              <Text style={styles.stockBarLabel}>{lang === 'mr' ? 'उपलब्ध साठा' : 'In Stock'}</Text>
                              <Text style={styles.stockBarQty}>{qtyVal} {unitVal}</Text>
                            </View>
                            <View style={styles.stockBarTrack}>
                              <View style={[styles.stockBarFill, { width: `${fillPct}%` }]} />
                            </View>
                          </View>

                          {/* Actions */}
                          <View style={styles.cardButtonRow}>
                            <TouchableOpacity
                              style={[styles.secondaryButton, { flex: 1, paddingVertical: 10 }]}
                              onPress={() => {
                                setSelectedListing(item);
                                navigateTo('quality');
                              }}
                            >
                              <Ionicons name="analytics-outline" size={15} color="#15803D" style={{ marginRight: 4 }} />
                              <Text style={styles.secondaryBtnText}>{lang === 'mr' ? 'गुणवत्ता तपासणी' : 'Quality Proof'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.primaryButtonSmall, { flex: 1, paddingVertical: 10 }]}
                              onPress={() => navigateTo('offers')}
                            >
                              <Ionicons name="pricetag-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                              <Text style={styles.primaryBtnText}>{lang === 'mr' ? 'ऑफर पहा' : 'View Offers'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}

            {/* ENHANCED OFFERS TAB WITH OFFER RETURN ANALYSIS */}
            {screen === 'offers' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionHeader}>Offers & Net Return Analysis</Text>
                  <TouchableOpacity style={styles.dropdownPill} onPress={() => setOfferFilterModalVisible(true)}>
                    <Text style={styles.dropdownPillText}>Filter: {selectedOfferFilter}</Text>
                    <Ionicons name="chevron-down" size={14} color="#15803D" />
                  </TouchableOpacity>
                </View>

                {(!dashboard?.offers || dashboard.offers.length === 0) ? (
                  <EmptyState
                    title="No offers received yet"
                    description="Buyers will see your produce and submit direct price offers when available."
                    icon="pricetag-outline"
                  />
                ) : (
                  dashboard.offers
                    .filter((off: any) => selectedOfferFilter === 'ALL' || off.status === selectedOfferFilter)
                    .map((offer: any, idx: number) => {
                      const offPrice = Number(offer.offerPrice || 34);
                      const offQty = Number(offer.quantity || 500);
                      const grossVal = offPrice * offQty;
                      const estTransport = 1200;
                      const expectedNetReturn = grossVal - estTransport;
                      const isGoodOffer = offPrice >= 33;

                      return (
                        <View key={offer.id || idx} style={styles.productCard}>
                          <View style={styles.productCardHeader}>
                            <View>
                              <Text style={styles.productName}>{offer.buyerName || 'Verified Buyer A (Pune)'}</Text>
                              <Text style={styles.productQty}>{offer.cropName || 'Tomato'} | {offQty} kg</Text>
                            </View>
                            <View style={[styles.badgeGreenLight, { backgroundColor: isGoodOffer ? '#F0FDF4' : '#FFF7ED' }]}>
                              <Text style={[styles.badgeTextGreen, { color: isGoodOffer ? '#15803D' : '#C05621' }]}>
                                {isGoodOffer ? 'GOOD OFFER' : 'CONSIDER NEGOTIATION'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.certDivider} />

                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>OFFER RETURN BREAKDOWN</Text>
                          <View style={styles.reviewRow}>
                            <Text style={styles.reviewLabel}>Buyer Offer Price:</Text>
                            <Text style={styles.reviewVal}>₹{offPrice}/kg (Gross: ₹{grossVal.toLocaleString('en-IN')})</Text>
                          </View>
                          <View style={styles.reviewRow}>
                            <Text style={styles.reviewLabel}>Est. Transportation:</Text>
                            <Text style={[styles.reviewVal, { color: '#C53030' }]}>-₹{estTransport.toLocaleString('en-IN')}</Text>
                          </View>
                          <View style={styles.reviewRow}>
                            <Text style={styles.reviewLabel}>Expected Net Selling Return:</Text>
                            <Text style={[styles.reviewVal, { color: '#15803D', fontWeight: '700' }]}>₹{expectedNetReturn.toLocaleString('en-IN')}</Text>
                          </View>

                          <View style={styles.whyBox}>
                            <Text style={styles.whyTitle}>PikMoolya Recommendation:</Text>
                            <Text style={styles.whyText}>
                              {isGoodOffer
                                ? `At ₹${offPrice}/kg your expected net selling return is ₹${expectedNetReturn.toLocaleString('en-IN')} after transport. This offer provides a solid return.`
                                : `At ₹${offPrice}/kg your expected net selling return is ₹${expectedNetReturn.toLocaleString('en-IN')}. Consider countering at ₹36/kg to improve your net return.`}
                            </Text>
                          </View>

                          {offer.status === 'PENDING' || !offer.status ? (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                              <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1, backgroundColor: '#15803D' }]}
                                onPress={() => {
                                  setSelectedOfferForAccept(offer);
                                  setAcceptModalVisible(true);
                                }}
                              >
                                <Text style={styles.primaryBtnText}>Accept Offer</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.outlineButton, { flex: 1 }]}
                                onPress={() => {
                                  setSelectedOfferForCounter(offer);
                                  setCounterModalVisible(true);
                                }}
                              >
                                <Text style={styles.outlineBtnText}>Counter (₹36/kg)</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.secondaryButton, { flex: 1 }]}
                                onPress={() => handleRejectOffer(offer.id)}
                              >
                                <Text style={[styles.secondaryBtnText, { color: '#C53030' }]}>Reject</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                )}
              </ScrollView>
            )}

            {/* ENHANCED ORDERS TAB WITH LOGISTICS SELECTION & LIVE NET RETURN RECALCULATION */}
            {screen === 'orders' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Confirmed Orders & Logistics</Text>

                {/* CONFIRMED ORDER CARD */}
                <View style={styles.productCard}>
                  <View style={styles.productCardHeader}>
                    <View>
                      <Text style={styles.productName}>Order #PM-98421</Text>
                      <Text style={styles.productQty}>Tomato | 500 kg | Buyer: Reliance Fresh</Text>
                    </View>
                    <StatusBadge status="Confirmed" />
                  </View>

                  <View style={styles.certDivider} />

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Agreed Selling Price:</Text>
                    <Text style={styles.reviewVal}>₹34/kg (Gross: ₹17,000)</Text>
                  </View>

                  {/* LOGISTICS PARTNER SELECTION */}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 12, marginBottom: 6 }}>
                    LOGISTICS PARTNER SELECTION
                  </Text>
                  {LOGISTICS_PARTNERS.map((p) => {
                    const isSelected = selectedLogisticsId === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.logisticsChip, isSelected && styles.logisticsChipSelected]}
                        onPress={() => setSelectedLogisticsId(p.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSelected ? '#15803D' : '#94A3B8'}
                          style={{ marginRight: 8 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.logisticsName, isSelected && styles.logisticsNameSelected]}>{p.name}</Text>
                          <Text style={styles.logisticsSub}>{p.vehicle} | ETA {p.eta}</Text>
                        </View>
                        <Text style={[styles.logisticsCost, isSelected && styles.logisticsCostSelected]}>₹{p.cost.toLocaleString('en-IN')}</Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* LIVE REAL-TIME NET RETURN RECALCULATION */}
                  {(() => {
                    const activeLogistics = LOGISTICS_PARTNERS.find((p) => p.id === selectedLogisticsId) || LOGISTICS_PARTNERS[0];
                    const grossVal = 17000;
                    const tCost = activeLogistics.cost;
                    const liveNetReturn = grossVal - tCost;

                    return (
                      <View style={styles.liveProfitBox}>
                        <Text style={styles.liveProfitTitle}>LIVE EXPECTED NET RETURN CALCULATION</Text>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Gross Agreed Selling Value:</Text>
                          <Text style={styles.calcVal}>₹{grossVal.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.calcRow}>
                          <Text style={styles.calcLabel}>Logistics ({activeLogistics.vehicle}):</Text>
                          <Text style={[styles.calcVal, { color: '#C53030' }]}>-₹{tCost.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.certDivider} />
                        <View style={styles.calcRow}>
                          <Text style={[styles.calcLabel, { fontWeight: '700', fontSize: 13 }]}>UPDATED EXPECTED NET SELLING RETURN:</Text>
                          <Text style={[styles.calcVal, { fontWeight: '700', fontSize: 15, color: '#15803D' }]}>
                            ₹{liveNetReturn.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* CLEAN ORDER TIMELINE */}
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineStep}>
                      <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                      <Text style={styles.timelineLabel}>Confirmed</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineStep}>
                      <Ionicons name="cube-outline" size={18} color="#15803D" />
                      <Text style={styles.timelineLabel}>Pickup</Text>
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineStep}>
                      <Ionicons name="bus-outline" size={18} color="#718096" />
                      <Text style={styles.timelineLabel}>In Transit</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* QUALITY ASSESSMENT RESULT SCREEN + GENERATE CERTIFICATE */}
            {screen === 'quality' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backLink} onPress={() => navigateTo('home')}>
                  <Ionicons name="arrow-back" size={18} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.backLinkText}>{t('home', lang)}</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{t('quality', lang)} {t('visualAnalysis', lang)}</Text>

                  {confirmedPhoto ? (
                    <Image source={{ uri: confirmedPhoto.uri }} style={styles.qualityImagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#718096" />
                      <Text style={styles.placeholderText}>Visual Analysis</Text>
                    </View>
                  )}

                  {qualityLoading ? (
                    <ActivityIndicator color="#15803D" style={{ marginVertical: 20 }} />
                  ) : (
                    <>
                      <View style={styles.qualityScoreRow}>
                        <View style={styles.scoreCircle}>
                          <Text style={styles.scoreNumber}>{aiAssessment?.quality?.score || 86}</Text>
                          <Text style={styles.scoreMax}>/ 100</Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 16 }}>
                          <Text style={styles.gradeTitle}>{t('grade', lang)} {aiAssessment?.quality?.grade || 'A'}</Text>
                          <Text style={styles.gradeSub}>{aiAssessment?.quality?.visibleCondition || 'Good Quality Harvest'}</Text>
                        </View>
                      </View>

                      <Text style={styles.whyTitle}>{t('visualAnalysis', lang)}</Text>
                      <View style={styles.analysisGrid}>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>{t('color', lang)}</Text>
                          <Text style={styles.analysisVal}>Good</Text>
                        </View>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>{t('appearance', lang)}</Text>
                          <Text style={styles.analysisVal}>Good</Text>
                        </View>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>{t('sharpness', lang)}</Text>
                          <Text style={styles.analysisVal}>Good</Text>
                        </View>
                        <View style={styles.analysisItem}>
                          <Text style={styles.analysisLabel}>{t('visibleDefects', lang)}</Text>
                          <Text style={styles.analysisVal}>Minor</Text>
                        </View>
                      </View>

                      {/* GENERATE CERTIFICATE ACTION BUTTON */}
                      <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: '#1B5E20' }]}
                        onPress={generateQualityCertificate}
                        disabled={certLoading}
                      >
                        {certLoading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="ribbon-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryBtnText}>{t('generateCertificate', lang)}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            )}

            {/* AI CERTIFICATE DISPLAY SCREEN */}
            {screen === 'certificate' && activeCertificate && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backLink} onPress={() => navigateTo('home')}>
                  <Ionicons name="arrow-back" size={18} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.backLinkText}>{t('home', lang)}</Text>
                </TouchableOpacity>

                <View style={styles.certPaperCard}>
                  <View style={styles.certHeaderBanner}>
                    <Text style={styles.certHeaderTitle}>PIKMOOLYA</Text>
                    <Text style={styles.certHeaderSub}>{t('certificateTitle', lang)}</Text>
                  </View>

                  <View style={styles.certMetaRow}>
                    <Text style={styles.certMetaId}>ID: {activeCertificate.certificateId}</Text>
                    <Text style={styles.certMetaDate}>{activeCertificate.assessmentDate ? activeCertificate.assessmentDate.split('T')[0] : '2026-10-08'}</Text>
                  </View>

                  <View style={styles.certDivider} />

                  <Text style={styles.certSectionTitle}>PRODUCT DETAILS</Text>
                  <View style={styles.certDetailRow}>
                    <Text style={styles.certDetailLabel}>Product:</Text>
                    <Text style={styles.certDetailVal}>{activeCertificate.cropName} {activeCertificate.variety ? `(${activeCertificate.variety})` : ''}</Text>
                  </View>
                  <View style={styles.certDetailRow}>
                    <Text style={styles.certDetailLabel}>Quantity:</Text>
                    <Text style={styles.certDetailVal}>{activeCertificate.quantity} {activeCertificate.unit || 'kg'}</Text>
                  </View>
                  <View style={styles.certDetailRow}>
                    <Text style={styles.certDetailLabel}>Farmer:</Text>
                    <Text style={styles.certDetailVal}>{activeCertificate.farmerName || 'Registered Farmer'}</Text>
                  </View>
                  <View style={styles.certDetailRow}>
                    <Text style={styles.certDetailLabel}>Location:</Text>
                    <Text style={styles.certDetailVal}>{activeCertificate.location || 'Pune, Maharashtra'}</Text>
                  </View>

                  <View style={styles.certDivider} />

                  <Text style={styles.certSectionTitle}>AI QUALITY ASSESSMENT</Text>
                  <View style={styles.certScoreGrid}>
                    <View style={styles.certScoreBox}>
                      <Text style={styles.certScoreLabel}>{t('qualityScore', lang)}</Text>
                      <Text style={styles.certScoreVal}>{activeCertificate.qualityScore} / 100</Text>
                    </View>
                    <View style={styles.certScoreBox}>
                      <Text style={styles.certScoreLabel}>{t('grade', lang)}</Text>
                      <Text style={styles.certScoreVal}>Grade {activeCertificate.qualityGrade}</Text>
                    </View>
                  </View>

                  <View style={styles.certDivider} />

                  <Text style={styles.certSectionTitle}>VISUAL ASSESSMENT</Text>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Color:</Text>
                    <Text style={styles.reviewVal}>Good</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Appearance:</Text>
                    <Text style={styles.reviewVal}>Good</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Visible Defects:</Text>
                    <Text style={styles.reviewVal}>Minor</Text>
                  </View>

                  {activeCertificate.estimatedPrice ? (
                    <>
                      <View style={styles.certDivider} />
                      <Text style={styles.certSectionTitle}>AI PRICE INFORMATION</Text>
                      <Text style={styles.reviewVal}>Estimated Fair Price: ₹{activeCertificate.estimatedPrice} / kg</Text>
                    </>
                  ) : null}

                  {/* QR Verification Info Box */}
                  <View style={styles.certQrBox}>
                    <Ionicons name="qr-code-outline" size={60} color="#15803D" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803D' }}>VERIFY CERTIFICATE</Text>
                      <Text style={{ fontSize: 10, color: '#64748B' }}>Scan QR code to verify authenticity online.</Text>
                      <TouchableOpacity onPress={() => verifyCertificateOnline(activeCertificate.certificateId)}>
                        <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '700', marginTop: 4 }}>Verify Online</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.disclaimerText}>{t('disclaimerLegal', lang)}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginVertical: 12 }}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1, marginRight: 6 }]}
                    onPress={() => handleDownloadPdf(activeCertificate.id, activeCertificate.certificateId)}
                  >
                    <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>{t('downloadPdf', lang)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, { flex: 1, marginLeft: 6 }]}
                    onPress={() => handleDownloadPdf(activeCertificate.id, activeCertificate.certificateId)}
                  >
                    <Ionicons name="share-social-outline" size={18} color="#15803D" style={{ marginRight: 6 }} />
                    <Text style={styles.secondaryBtnText}>{t('shareCertificate', lang)}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* PUBLIC MOBILE CERTIFICATE VERIFICATION SCREEN */}
            {screen === 'verify' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backLink} onPress={() => navigateTo('home')}>
                  <Ionicons name="arrow-back" size={18} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.backLinkText}>{t('home', lang)}</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                  <View style={{ alignItems: 'center', marginVertical: 12 }}>
                    <View style={styles.verifySuccessCircle}>
                      <Ionicons name="checkmark-sharp" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.verifyTitle}>{t('certificateVerified', lang)} </Text>
                    <Text style={styles.verifySub}>Certificate is valid and authentic.</Text>
                  </View>

                  {verificationData ? (
                    <View style={styles.advancedBox}>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>{t('certificateId', lang)}:</Text>
                        <Text style={styles.reviewVal}>{verificationData.certificateId}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Product:</Text>
                        <Text style={styles.reviewVal}>{verificationData.product}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>{t('qualityScore', lang)}:</Text>
                        <Text style={styles.reviewVal}>{verificationData.qualityScore}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>{t('grade', lang)}:</Text>
                        <Text style={styles.reviewVal}>Grade {verificationData.grade}</Text>
                      </View>
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Date:</Text>
                        <Text style={styles.reviewVal}>{verificationData.assessmentDate}</Text>
                      </View>
                    </View>
                  ) : null}

                  <Text style={styles.disclaimerText}>{t('disclaimerLegal', lang)}</Text>
                </View>
              </ScrollView>
            )}

            {/* MY CERTIFICATES SCREEN */}
            {screen === 'my_certificates' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backLink} onPress={() => navigateTo('profile')}>
                  <Ionicons name="arrow-back" size={18} color="#15803D" style={{ marginRight: 4 }} />
                  <Text style={styles.backLinkText}>{t('profile', lang)}</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>{t('myCertificates', lang)}</Text>

                {myCertificatesList.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.emptyText}>No certificates generated yet.</Text>
                  </View>
                ) : (
                  myCertificatesList.map((cert) => (
                    <View key={cert.id} style={styles.card}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>{cert.cropName}</Text>
                        <View style={styles.badgeGreenLight}>
                          <Text style={styles.badgeTextGreen}>Grade {cert.qualityGrade}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardSubText}>ID: {cert.certificateId}</Text>
                      <Text style={styles.priceRowValBold}>Score: {cert.qualityScore} / 100</Text>

                      <TouchableOpacity
                        style={styles.outlineButton}
                        onPress={() => {
                          setActiveCertificate(cert);
                          navigateTo('certificate');
                        }}
                      >
                        <Text style={styles.outlineBtnText}>{t('viewCertificate', lang)}</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </>
        )}

        {/* ==================== 2. BUYER DASHBOARD & VIEWS ==================== */}
        {userRole === 'BUYER' && (
          <>
            {/* BUYER HOME DASHBOARD & SEARCH */}
            {(screen === 'home' || screen === 'buyer' || screen === 'buyer_search') && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* LIVE AGRICULTURAL EXCHANGE HEADER (MATCHING WEBSITE MARKETPLACE) */}
                <View style={styles.marketplaceHeaderBox}>
                  <View style={styles.exchangeBadge}>
                    <Ionicons name="storefront" size={13} color="#15803D" />
                    <Text style={styles.exchangeBadgeText}>LIVE AGRICULTURAL EXCHANGE</Text>
                  </View>
                  <Text style={styles.marketplaceTitle}>
                    {lang === 'mr' ? 'थेट शेतमाल बाजारपेठ' : 'Direct Produce Marketplace'}
                  </Text>
                  <Text style={styles.marketplaceSub}>
                    {lang === 'mr'
                      ? 'महाराष्ट्रातील थेट प्रमाणित शेतकऱ्यांचा शेतमाल, AI रास्त भाव आणि गुणवत्ता गुणपत्रिकेसह.'
                      : 'Direct farm harvests from certified Maharashtra farmers with AI fair prices and quality scores.'}
                  </Text>
                </View>

                {/* SEARCH INPUT */}
                <View style={styles.searchBarBox}>
                  <Ionicons name="search-outline" size={20} color="#718096" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 14, color: '#0F172A' }}
                    placeholder={t('searchCrops', lang)}
                    value={buyerRequiredQty}
                    onChangeText={setBuyerRequiredQty}
                  />
                </View>

                {/* HORIZONTAL CATEGORY FILTER PILLS (EXACT WEBSITE PARITY) */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterScroll}>
                  {[
                    { label: lang === 'mr' ? 'सर्व शेतमाल' : 'All Produce', value: 'ALL' },
                    { label: lang === 'mr' ? '🌾 गहू' : '🌾 Wheat', value: 'WHEAT' },
                    { label: lang === 'mr' ? '🍚 तांदूळ' : '🍚 Rice & Paddy', value: 'RICE' },
                    { label: lang === 'mr' ? '🌿 ज्वारी' : '🌿 Jowar', value: 'JOWAR' },
                    { label: lang === 'mr' ? '🌱 सोयाबीन' : '🌱 Soybean', value: 'SOYBEAN' },
                    { label: lang === 'mr' ? '🧅 कांदा' : '🧅 Onion & Veg', value: 'ONION' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.catFilterPill, activeMarketCategory === cat.value && styles.catFilterPillActive]}
                      onPress={() => setActiveMarketCategory(cat.value)}
                    >
                      <Text style={[styles.catFilterText, activeMarketCategory === cat.value && styles.catFilterTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* MAKE OFFER MODAL FORM IF A LISTING IS SELECTED */}
                {selectedBuyerListing ? (
                  <View style={[styles.card, { borderColor: '#15803D', borderWidth: 2 }]}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>Submit Offer for {selectedBuyerListing.crop?.name || selectedBuyerListing.cropName || 'Produce'}</Text>
                      <TouchableOpacity onPress={() => setSelectedBuyerListing(null)}>
                        <Ionicons name="close-circle" size={22} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>Offer Price per Kg (₹)</Text>
                    <TextInput
                      style={styles.input}
                      value={buyerOfferPrice}
                      onChangeText={setBuyerOfferPrice}
                      keyboardType="numeric"
                      placeholder="e.g. 34"
                    />

                    <Text style={styles.inputLabel}>Required Quantity (Kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={buyerOfferQuantity}
                      onChangeText={setBuyerOfferQuantity}
                      keyboardType="numeric"
                      placeholder="e.g. 500"
                    />

                    <Text style={styles.inputLabel}>Note for Farmer (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={buyerOfferMessage}
                      onChangeText={setBuyerOfferMessage}
                      placeholder="e.g. Can pick up tomorrow morning"
                    />

                    <TouchableOpacity
                      style={[styles.primaryButton, { marginTop: 12 }]}
                      onPress={() => handleSubmitBuyerOffer(selectedBuyerListing.id || selectedBuyerListing.listingId)}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Send Offer to Farmer</Text>}
                    </TouchableOpacity>
                  </View>
                ) : null}

                <Text style={styles.sectionHeader}>{t('recommendedProduce', lang)}</Text>
                {(() => {
                  const rawList = (buyerDashboard?.produce && buyerDashboard.produce.length > 0)
                    ? buyerDashboard.produce
                    : (marketplaceProducts && marketplaceProducts.length > 0)
                    ? marketplaceProducts
                    : [
                        { id: 'def-1', cropName: 'Wheat (Sharbati)', location: 'Pune APMC Mandi', expectedPrice: 24.5, predictedFairPrice: 24, quantity: 500, unit: 'kg', quality: { grade: 'A', score: 92 } },
                        { id: 'def-2', cropName: 'Rice (Basmati)', location: 'Nashik APMC Mandi', expectedPrice: 32, predictedFairPrice: 31.5, quantity: 400, unit: 'kg', quality: { grade: 'A', score: 88 } },
                        { id: 'def-3', cropName: 'Soybean (Yellow)', location: 'Latur APMC Mandi', expectedPrice: 44, predictedFairPrice: 43.5, quantity: 600, unit: 'kg', quality: { grade: 'B', score: 82 } },
                        { id: 'def-4', cropName: 'Jowar (Maldandi)', location: 'Solapur APMC Mandi', expectedPrice: 28.5, predictedFairPrice: 28, quantity: 350, unit: 'kg', quality: { grade: 'A', score: 90 } },
                      ];

                  const filtered = rawList.filter((item: any) => {
                    const cName = (item.crop?.name || item.cropName || '').toLowerCase();
                    if (activeMarketCategory === 'WHEAT') return cName.includes('wheat') || cName.includes('gehun');
                    if (activeMarketCategory === 'RICE') return cName.includes('rice') || cName.includes('chawal') || cName.includes('paddy');
                    if (activeMarketCategory === 'JOWAR') return cName.includes('jowar') || cName.includes('sorghum');
                    if (activeMarketCategory === 'SOYBEAN') return cName.includes('soybean') || cName.includes('soya');
                    if (activeMarketCategory === 'ONION') return cName.includes('onion') || cName.includes('kanda') || cName.includes('veg') || cName.includes('tomato');
                    return true;
                  });

                  return filtered.map((item: any, idx: number) => {
                    const cName = item.crop?.name || item.cropName || 'Produce';
                    const imgSrc = getCropImage(cName, item.photoUri || item.imageUrl);
                    const qtyVal = Number(item.quantity || item.totalAvailableQuantity || 500);
                    const unitVal = item.unit || 'kg';
                    const priceVal = Number(item.expectedPrice || 35);
                    const aiFairVal = item.predictedFairPrice || Math.round(priceVal * 0.96);
                    const gradeVal = item.quality?.grade || item.qualityCategory?.replace('Grade ', '') || 'A';
                    const scoreVal = item.quality?.score || Math.round(item.qualityScore || 86);
                    const fillPct = Math.min(100, Math.max(20, (qtyVal / 500) * 100));

                    return (
                      <View key={item.id || item.listingId || idx} style={styles.mobileProductCard}>
                        {/* Image Header */}
                        <View style={styles.cardImageWrapper}>
                          <Image source={{ uri: imgSrc }} style={styles.cardImage} resizeMode="cover" />
                          <View style={styles.cardCategoryBadge}>
                            <Text style={styles.cardCategoryText}>{item.crop?.variety || (lang === 'mr' ? 'शेतमाल' : 'Agricultural Produce')}</Text>
                          </View>
                          <View style={styles.cardGradeBadge}>
                            <Ionicons name="ribbon" size={13} color="#15803D" />
                            <Text style={styles.cardGradeText}>Grade {gradeVal}</Text>
                            <Text style={styles.cardGradeSub}>({scoreVal}/100)</Text>
                          </View>
                        </View>

                        {/* Content Body */}
                        <View style={styles.cardContent}>
                          <View style={styles.cardTitleRow}>
                            <Text style={styles.cardCropTitle}>{cName}</Text>
                            <View style={styles.badgeGreenLight}>
                              <Text style={styles.badgeTextGreen}>Verified Farm</Text>
                            </View>
                          </View>

                          <View style={styles.cardLocationRow}>
                            <Ionicons name="location-outline" size={13} color="#64748B" />
                            <Text style={styles.cardLocationText}>
                              {item.location || item.locationApproximate || 'Pune APMC Mandi'}
                            </Text>
                          </View>

                          {/* Price Box */}
                          <View style={styles.cardPriceBox}>
                            <View style={styles.cardPriceRow}>
                              <View>
                                <Text style={styles.priceAskLabel}>{lang === 'mr' ? 'शेतकऱ्याचा भाव' : 'Seller Asking Price'}</Text>
                                <Text style={styles.priceAskValue}>
                                  ₹{priceVal.toLocaleString('en-IN')}{' '}
                                  <Text style={styles.priceAskUnit}>/{unitVal}</Text>
                                </Text>
                              </View>
                              <View style={styles.aiFairPill}>
                                <Ionicons name="trending-up" size={12} color="#15803D" />
                                <Text style={styles.aiFairText}>
                                  {lang === 'mr' ? 'AI रास्त:' : 'AI Fair:'} ₹{aiFairVal}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Stock Availability */}
                          <View style={styles.stockBarContainer}>
                            <View style={styles.stockBarLabelRow}>
                              <Text style={styles.stockBarLabel}>{lang === 'mr' ? 'उपलब्ध साठा' : 'Available Stock'}</Text>
                              <Text style={styles.stockBarQty}>{qtyVal} {unitVal}</Text>
                            </View>
                            <View style={styles.stockBarTrack}>
                              <View style={[styles.stockBarFill, { width: `${fillPct}%` }]} />
                            </View>
                          </View>

                          {/* Action Button */}
                          <TouchableOpacity
                            style={[styles.primaryButton, { paddingVertical: 12 }]}
                            onPress={() => {
                              setSelectedBuyerListing(item);
                              setBuyerOfferPrice(String(item.expectedPrice || 34));
                              setBuyerOfferQuantity(String(item.quantity || 500));
                            }}
                          >
                            <Ionicons name="pricetag-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.primaryBtnText}>{t('makeOffer', lang)}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  });
                })()}
              </ScrollView>
            )}

            {/* BUYER SUBMITTED OFFERS SCREEN */}
            {screen === 'offers' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>My Submitted Purchase Offers</Text>
                {buyerOffers.length === 0 ? (
                  <EmptyState
                    title="No offers submitted yet"
                    description="Browse available produce in the marketplace to submit direct offers to farmers."
                    icon="pricetag-outline"
                    actionLabel="Browse Marketplace"
                    onAction={() => navigateTo('buyer')}
                  />
                ) : (
                  buyerOffers.map((offer: any, idx: number) => (
                    <View key={offer.id || idx} style={styles.productCard}>
                      <View style={styles.productCardHeader}>
                        <View>
                          <Text style={styles.productName}>{offer.cropName || 'Produce'}</Text>
                          <Text style={styles.productQty}>Farmer: {offer.farmerName || 'Registered Farmer'}</Text>
                        </View>
                        <StatusBadge status={offer.status || 'PENDING'} />
                      </View>

                      <View style={styles.certDivider} />

                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>My Offered Price:</Text>
                        <Text style={[styles.reviewVal, { color: '#15803D', fontWeight: '700' }]}>₹{offer.offerPrice}/kg</Text>
                      </View>

                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Quantity:</Text>
                        <Text style={styles.reviewVal}>{offer.quantity || 500} kg</Text>
                      </View>

                      {offer.status === 'PENDING' && (
                        <TouchableOpacity
                          style={[styles.secondaryButton, { marginTop: 10 }]}
                          onPress={() => handleWithdrawBuyerOffer(offer.id)}
                        >
                          <Text style={[styles.secondaryBtnText, { color: '#C53030' }]}>Withdraw Offer</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* BUYER ORDERS SCREEN */}
            {screen === 'orders' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>My Orders & Deliveries</Text>
                <OrderTimeline status="IN_TRANSIT" role="BUYER" />
              </ScrollView>
            )}
          </>
        )}

        {/* ==================== 3. LOGISTICS PARTNER DASHBOARD & VIEWS ==================== */}
        {userRole === 'LOGISTICS_PARTNER' && (
          <>
            {(screen === 'home' || screen === 'orders') && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.welcomeBox}>
                  <Text style={styles.greetingTitle}>Logistics & Delivery Operations </Text>
                  <Text style={styles.greetingSub}>Manage produce pickup and transport requests</Text>
                </View>

                <Text style={styles.sectionHeader}>Available & Active Transport Jobs ({logisticsRequests.length})</Text>

                {logisticsRequests.length === 0 ? (
                  <EmptyState
                    title="No delivery requests active"
                    description="Confirmed farmer-buyer transactions needing transportation will be dispatched here."
                    icon="bus-outline"
                  />
                ) : (
                  logisticsRequests.map((req) => (
                    <LogisticsCard
                      key={req.id}
                      request={req}
                      isLogisticsPartner={true}
                      onAccept={handleAcceptLogisticsRequest}
                      onReject={handleRejectLogisticsRequest}
                      onUpdateStatus={handleUpdateLogisticsStatus}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </>
        )}

        {/* ==================== 4. ADMIN DASHBOARD & VIEWS ==================== */}
        {userRole === 'ADMIN' && (
          <>
            {screen === 'home' && (
              <AdminDashboardView
                stats={adminStats}
                onRefresh={() => fetchAdminStats(token!)}
                onSelectTab={(tab) => {
                  console.log('Admin selected tab:', tab);
                  if (tab === 'logistics') navigateTo('orders');
                }}
              />
            )}

            {screen === 'orders' && (
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>System Logistics & Order Management</Text>
                {logisticsRequests.length === 0 ? (
                  <EmptyState
                    title="No active system shipments"
                    description="Logistics delivery requests across all transactions will appear here."
                    icon="bus-outline"
                  />
                ) : (
                  logisticsRequests.map((req) => (
                    <LogisticsCard
                      key={req.id}
                      request={req}
                      isLogisticsPartner={false}
                    />
                  ))
                )}
              </ScrollView>
            )}
          </>
        )}

        {/* ==================== PROFILE TAB FOR ALL ROLES ==================== */}
        {screen === 'profile' && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>{t('profile', lang)}</Text>

            <View style={styles.card}>
              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <View style={{ marginBottom: 12 }}>
                  <PikMoolyaLogo size="medium" />
                </View>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={32} color="#15803D" />
                </View>
                <Text style={styles.profileName}>{userName || 'User'}</Text>
                <Text style={styles.profileSub}>{phone}</Text>
                <View style={[styles.badgeGreenLight, { marginTop: 6 }]}>
                  <Text style={styles.badgeTextGreen}>{userRole}</Text>
                </View>
              </View>

              {userRole === 'FARMER' && (
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => {
                    loadMyCertificates();
                    navigateTo('my_certificates');
                  }}
                >
                  <Ionicons name="ribbon-outline" size={18} color="#15803D" style={{ marginRight: 6 }} />
                  <Text style={styles.outlineBtnText}>{t('myCertificates', lang)}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.outlineButton, { marginTop: 10 }]}
                onPress={() => setLangModalVisible(true)}
              >
                <Ionicons name="globe-outline" size={18} color="#15803D" style={{ marginRight: 6 }} />
                <Text style={styles.outlineBtnText}>Language: {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}</Text>
              </TouchableOpacity>

              {/* SIGN OUT BUTTON (EXPLICIT CALL TO LOGOUT CLEARING SESSION) */}
              <TouchableOpacity
                style={[styles.secondaryButton, { marginTop: 18 }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color="#C53030" style={{ marginRight: 6 }} />
                <Text style={[styles.secondaryBtnText, { color: '#C53030' }]}>{t('signOut', lang)}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ==================== MESSAGES TAB FOR ALL ROLES ==================== */}
        {screen === 'messages' && (
          <View style={{ flex: 1, padding: 16 }}>
            <Text style={styles.sectionHeader}>Transaction Messages & Inquiries</Text>
            <View style={styles.chatContainer}>
              <ScrollView style={{ flex: 1, padding: 12 }} showsVerticalScrollIndicator={false}>
                {messagesList.map((msg) => {
                  const isMe = msg.senderRole === userRole;
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.chatBubble,
                        isMe ? styles.chatBubbleRight : styles.chatBubbleLeft,
                      ]}
                    >
                      <Text style={[styles.chatSender, isMe && { color: '#F0FDF4' }]}>
                        {msg.senderName} ({msg.senderRole})
                      </Text>
                      {msg.linkedItem ? (
                        <View style={[styles.chatLinkedBadge, isMe && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <Ionicons name="link-outline" size={12} color={isMe ? '#FFFFFF' : '#15803D'} />
                          <Text style={[styles.chatLinkedBadgeText, isMe && { color: '#FFFFFF' }]}>
                            {msg.linkedItem}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={[styles.chatText, isMe && { color: '#FFFFFF' }]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.chatTime, isMe && { color: '#DCFCE7' }]}>
                        {msg.timestamp}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type transaction message..."
                  placeholderTextColor="#94A3B8"
                  value={chatInputText}
                  onChangeText={setChatInputText}
                />
                <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChatMessage}>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ==================== ADMIN USER MANAGEMENT ==================== */}
        {userRole === 'ADMIN' && screen === 'users' && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>Platform User Directory & Roles</Text>
            {[
              { name: 'Ramesh Farmer', phone: '+919876543210', role: 'FARMER', lang: 'English (en)', status: 'ACTIVE' },
              { name: 'Reliance Fresh Buyer', phone: '+919876543211', role: 'BUYER', lang: 'English (en)', status: 'ACTIVE' },
              { name: 'Pune Express Logistics', phone: '+919876543212', role: 'LOGISTICS_PARTNER', lang: 'Marathi (mr)', status: 'ACTIVE' },
              { name: 'PikMoolya Admin', phone: '+919876543213', role: 'ADMIN', lang: 'English (en)', status: 'ACTIVE' },
            ].map((usr, i) => (
              <View key={i} style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <View>
                    <Text style={styles.productName}>{usr.name}</Text>
                    <Text style={styles.productQty}>{usr.phone} | {usr.lang}</Text>
                  </View>
                  <View style={styles.badgeGreenLight}>
                    <Text style={styles.badgeTextGreen}>{usr.role}</Text>
                  </View>
                </View>
                <View style={styles.certDivider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#166534', fontWeight: '700' }}>Status: {usr.status}</Text>
                  <TouchableOpacity
                    style={styles.primaryButtonSmall}
                    onPress={() => showToast(`Account settings updated for ${usr.name}`)}
                  >
                    <Text style={styles.primaryBtnText}>Manage User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ==================== ADMIN AUDIT LOGS & REPORTS ==================== */}
        {userRole === 'ADMIN' && screen === 'reports' && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>System Activity & Audit Logs</Text>
            {[
              { event: 'AI Price Assessment Executed', details: 'Tomato (Pune APMC) Fair Price calculated at ₹35/kg', time: '10 mins ago', status: 'SUCCESS' },
              { event: 'Offer Negotiation Completed', details: 'Buyer #BUY-910 accepted counter-offer of ₹34/kg for 500 kg Tomato', time: '25 mins ago', status: 'CONFIRMED' },
              { event: 'Logistics Pickup Dispatched', details: 'Logistics Partner A assigned to pickup #PM-98421', time: '40 mins ago', status: 'IN_TRANSIT' },
              { event: 'AI Quality Certificate Issued', details: 'Certificate #CERT-8841 generated for 500 kg Tomato (Grade A)', time: '1 hour ago', status: 'VERIFIED' },
            ].map((log, i) => (
              <View key={i} style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.productName}>{log.event}</Text>
                    <Text style={styles.productQty}>{log.details}</Text>
                  </View>
                  <View style={styles.badgeGreenLight}>
                    <Text style={styles.badgeTextGreen}>{log.status}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>{log.time}</Text>
              </View>
            ))}
          </ScrollView>
        )}

      </View>

      {/* ROLE-SPECIFIC BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        {userRole === 'FARMER' && (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('home')}>
              <Ionicons name={screen === 'home' ? 'home' : 'home-outline'} size={20} color={screen === 'home' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'home' && styles.navLabelActive]}>{t('home', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('listing')}>
              <Ionicons name={screen === 'listing' ? 'leaf' : 'leaf-outline'} size={20} color={screen === 'listing' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'listing' && styles.navLabelActive]}>Products</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('offers')}>
              <Ionicons name={screen === 'offers' ? 'pricetag' : 'pricetag-outline'} size={20} color={screen === 'offers' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'offers' && styles.navLabelActive]}>{t('offers', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('orders')}>
              <Ionicons name={screen === 'orders' ? 'receipt' : 'receipt-outline'} size={20} color={screen === 'orders' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'orders' && styles.navLabelActive]}>{t('orders', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('messages')}>
              <Ionicons name={screen === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} size={20} color={screen === 'messages' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'messages' && styles.navLabelActive]}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('profile')}>
              <Ionicons name={screen === 'profile' ? 'person' : 'person-outline'} size={20} color={screen === 'profile' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'profile' && styles.navLabelActive]}>{t('profile', lang)}</Text>
            </TouchableOpacity>
          </>
        )}

        {userRole === 'BUYER' && (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('buyer')}>
              <Ionicons name={(screen === 'home' || screen === 'buyer') ? 'storefront' : 'storefront-outline'} size={20} color={(screen === 'home' || screen === 'buyer') ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, (screen === 'home' || screen === 'buyer') && styles.navLabelActive]}>Market</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('offers')}>
              <Ionicons name={screen === 'offers' ? 'pricetag' : 'pricetag-outline'} size={20} color={screen === 'offers' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'offers' && styles.navLabelActive]}>My Offers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('orders')}>
              <Ionicons name={screen === 'orders' ? 'receipt' : 'receipt-outline'} size={20} color={screen === 'orders' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'orders' && styles.navLabelActive]}>{t('orders', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('messages')}>
              <Ionicons name={screen === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} size={20} color={screen === 'messages' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'messages' && styles.navLabelActive]}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('profile')}>
              <Ionicons name={screen === 'profile' ? 'person' : 'person-outline'} size={20} color={screen === 'profile' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'profile' && styles.navLabelActive]}>{t('profile', lang)}</Text>
            </TouchableOpacity>
          </>
        )}

        {userRole === 'LOGISTICS_PARTNER' && (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('home')}>
              <Ionicons name={screen === 'home' ? 'bus' : 'bus-outline'} size={20} color={screen === 'home' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'home' && styles.navLabelActive]}>Deliveries</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('orders')}>
              <Ionicons name={screen === 'orders' ? 'receipt' : 'receipt-outline'} size={20} color={screen === 'orders' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'orders' && styles.navLabelActive]}>My Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('messages')}>
              <Ionicons name={screen === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} size={20} color={screen === 'messages' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'messages' && styles.navLabelActive]}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('profile')}>
              <Ionicons name={screen === 'profile' ? 'person' : 'person-outline'} size={20} color={screen === 'profile' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'profile' && styles.navLabelActive]}>{t('profile', lang)}</Text>
            </TouchableOpacity>
          </>
        )}

        {userRole === 'ADMIN' && (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('home')}>
              <Ionicons name={screen === 'home' ? 'stats-chart' : 'stats-chart-outline'} size={20} color={screen === 'home' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'home' && styles.navLabelActive]}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('users')}>
              <Ionicons name={screen === 'users' ? 'people' : 'people-outline'} size={20} color={screen === 'users' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'users' && styles.navLabelActive]}>Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('orders')}>
              <Ionicons name={screen === 'orders' ? 'bus' : 'bus-outline'} size={20} color={screen === 'orders' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'orders' && styles.navLabelActive]}>Logistics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('reports')}>
              <Ionicons name={screen === 'reports' ? 'document-text' : 'document-text-outline'} size={20} color={screen === 'reports' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'reports' && styles.navLabelActive]}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('messages')}>
              <Ionicons name={screen === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} size={20} color={screen === 'messages' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'messages' && styles.navLabelActive]}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('profile')}>
              <Ionicons name={screen === 'profile' ? 'person' : 'person-outline'} size={20} color={screen === 'profile' ? '#15803D' : '#718096'} />
              <Text style={[styles.navLabel, screen === 'profile' && styles.navLabelActive]}>{t('profile', lang)}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* NOTIFICATION MODAL COMPONENT */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* REAL CAMERA MODAL COMPONENT */}
      <CameraCaptureModal
        visible={cameraModalVisible}
        onClose={() => setCameraModalVisible(false)}
        onPhotoCaptured={handleCameraPhotoCaptured}
        apiUrl={API_URL}
        token={token}
      />

      {/* LOCATION SELECTOR BOTTOM SHEET MODAL */}
      <LocationSelectorModal
        visible={locationModalVisible}
        selectedLocation={locationName}
        onSelectLocation={(loc) => setLocationName(loc)}
        onClose={() => setLocationModalVisible(false)}
      />

      {/* UNIT SELECTOR BOTTOM SHEET MODAL */}
      <SelectionBottomSheet
        visible={unitModalVisible}
        title="Select Quantity Unit"
        subtitle="Choose measurement unit for your agricultural produce"
        icon="scale-outline"
        options={UNIT_OPTIONS}
        selectedValue={qtyUnit}
        onSelect={(opt) => setQtyUnit(opt.id)}
        onClose={() => setUnitModalVisible(false)}
      />

      {/* MARKET SELECTOR BOTTOM SHEET MODAL */}
      <SelectionBottomSheet
        visible={marketModalVisible}
        title="Select APMC Market"
        subtitle="Select a nearby market to view distance and expected net return"
        icon="location-outline"
        options={marketOptions}
        searchable={true}
        searchPlaceholder="Search nearby markets..."
        onSelect={(opt) => {
          if (opt.value) {
            Alert.alert('Market Selected', `Selected ${opt.label}. Expected Net Return: ₹${opt.value.expectedNetSellingReturn?.toLocaleString('en-IN')}`);
          }
        }}
        onClose={() => setMarketModalVisible(false)}
      />

      {/* OFFER FILTER BOTTOM SHEET MODAL */}
      <SelectionBottomSheet
        visible={offerFilterModalVisible}
        title="Filter Offers"
        subtitle="Filter received buyer offers by status"
        icon="filter-outline"
        options={OFFER_FILTER_OPTIONS}
        selectedValue={selectedOfferFilter}
        onSelect={(opt) => setSelectedOfferFilter(opt.id)}
        onClose={() => setOfferFilterModalVisible(false)}
      />

      {/* LANGUAGE SELECTOR MODAL FOR AUTHENTICATED USERS */}
      <LanguageSelectorModal
        visible={langModalVisible}
        currentLanguage={lang}
        onSelectLanguage={(newLang) => changeLanguageHandler(newLang)}
        onClose={() => setLangModalVisible(false)}
      />

      {/* CROP SELECTOR MODAL WITH OPAQUE BOTTOM SHEET BACKDROP */}
      <CropSelectorModal
        visible={cropDropdownOpen}
        crops={crops}
        selectedCropId={selectedCrop?.id}
        onSelectCrop={(crop) => setSelectedCrop(crop)}
        onClose={() => setCropDropdownOpen(false)}
      />

      {/* COUNTER OFFER MODAL WITH OPAQUE BOTTOM SHEET BACKDROP */}
      <CounterOfferModal
        visible={counterModalVisible}
        offer={selectedOfferForCounter}
        onSendCounter={handleSendCounterOffer}
        onClose={() => {
          setCounterModalVisible(false);
          setSelectedOfferForCounter(null);
        }}
      />

      {/* ACCEPT OFFER MODAL WITH OPTIONAL LOGISTICS (OPTION A vs OPTION B) */}
      <AcceptOfferModal
        visible={acceptModalVisible}
        offer={selectedOfferForAccept}
        onAccept={handleAcceptOffer}
        onClose={() => {
          setAcceptModalVisible(false);
          setSelectedOfferForAccept(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  authScrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  authBrandSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  authLogoImage: {
    width: 220,
    height: 75,
  },
  authTitleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  authMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  authSubTitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  authFormContainer: {
    width: '100%',
  },
  fieldGap: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 14,
    marginBottom: 4,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 4,
  },
  countryPrefixBox: {
    height: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  countryPrefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  fieldTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 8,
  },
  forgotPassText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  errorMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
  },
  successMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  successText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
  },
  mainSubmitBtn: {
    backgroundColor: '#15803D',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mainSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchSub: {
    fontSize: 13,
    color: '#64748B',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  authFootnote: {
    marginTop: 28,
    alignItems: 'center',
  },
  authFootnoteText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bestMarketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#15803D',
    marginBottom: 16,
    overflow: 'hidden',
  },
  bestMarketHeader: {
    backgroundColor: '#15803D',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestMarketHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bestMarketName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  bestMarketDist: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  analysisMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  profitBadgeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  profitBadgeText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  whyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  whyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  whyText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  priceEvidenceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priceEvidenceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priceEvidenceTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  priceEvidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 4,
  },
  priceEvidenceSub: {
    fontSize: 9,
    color: '#94A3B8',
  },
  expandCalcBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    marginBottom: 12,
  },
  expandCalcBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginRight: 6,
  },
  calcBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  calcBreakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: 13,
    color: '#475569',
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  calcNoteText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  logisticsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  logisticsChipSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#15803D',
  },
  logisticsName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  logisticsNameSelected: {
    fontWeight: '700',
    color: '#15803D',
  },
  logisticsSub: {
    fontSize: 11,
    color: '#64748B',
  },
  logisticsCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  logisticsCostSelected: {
    color: '#15803D',
  },
  liveProfitBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  liveProfitTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  dropdownPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  unitSelectorRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  unitBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitBtnSelected: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  unitBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#15803D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#15803D',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#15803D',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  outlineBtnText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 13,
  },
  mainBody: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeBox: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  greetingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  fairPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeGreenLight: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTextGreen: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  priceActionBtn: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  priceActionBtnText: {
    color: '#15803D',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickActionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  miniProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  miniProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  miniProductQty: {
    fontSize: 14,
    color: '#64748B',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardCategoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardGradeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardGradeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  cardGradeSub: {
    fontSize: 9,
    color: '#64748B',
  },
  cardContent: {
    padding: 14,
  },
  cardCropTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLocationText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  cardPriceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceAskLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  priceAskValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceAskUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  aiFairPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  aiFairText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  stockBarContainer: {
    marginBottom: 12,
  },
  stockBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stockBarLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  stockBarQty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  stockBarTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    backgroundColor: '#15803D',
    borderRadius: 3,
  },
  cardButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  productQty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  reviewLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  reviewVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  timelineStep: {
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backLinkText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  placeholderText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  qualityScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#15803D',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#15803D',
  },
  scoreMax: {
    fontSize: 10,
    color: '#64748B',
  },
  gradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  gradeSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  analysisItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  analysisLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  analysisVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  certPaperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  certHeaderBanner: {
    alignItems: 'center',
    marginBottom: 12,
  },
  certHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 1,
  },
  certHeaderSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
  },
  certMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  certMetaId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  certMetaDate: {
    fontSize: 11,
    color: '#64748B',
  },
  certDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  certSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  certDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  certDetailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  certDetailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  certScoreGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
  },
  certScoreBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certScoreLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  certScoreVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 4,
  },
  certQrBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 10,
  },
  verifySuccessCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  advancedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  wizardHeader: {
    marginBottom: 16,
  },
  wizardStepText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  wizardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  wizardNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  photoAttachedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  photoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  photoMeta: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 12,
  },
  screenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRowValBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginVertical: 4,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  toastContainer: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  chatBubble: {
    maxWidth: '82%',
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 2,
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#15803D',
    borderBottomRightRadius: 2,
  },
  chatSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  chatLinkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  chatLinkedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  chatText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  chatTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 1-Click Demo Login Box Styles (Exact Website Mirror)
  demoLoginBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  demoLoginHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  demoLoginHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  demoLoginRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  demoBtnFarmer: {
    borderColor: '#BBF7D0',
  },
  demoBtnBuyer: {
    borderColor: '#BFDBFE',
  },
  demoBtnLogistics: {
    borderColor: '#FDE68A',
  },
  demoBtnTextFarmer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  demoBtnTextBuyer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  demoBtnTextLogistics: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },

  // Hero Platform Banner Styles (matching Web Home Hero)
  homeHeroBanner: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  heroMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  heroSubText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },

  // 2x2 Metric Highlights Grid (matching Web 4 Stat Cards)
  statsGrid2x2: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },

  // Quick Estimator Card (matching Web Preview Calculator)
  quickCalcCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickCalcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  quickCalcTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickCalcSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  calcCropPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  calcCropPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  calcCropPillActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#15803D',
  },
  calcCropPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  calcCropPillTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  calcQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calcQtyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  calcQtyPills: {
    flexDirection: 'row',
    gap: 6,
  },
  calcQtyBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  calcQtyBtnActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  calcQtyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  calcQtyBtnTextActive: {
    color: '#FFFFFF',
  },
  calcResultBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  calcResultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  calcResultAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    marginTop: 2,
  },
  calcResultRate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Core Architectural Pillars (matching Web 3 Pillars)
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pillarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Buyer Marketplace Header & Category Filter Styles
  marketplaceHeaderBox: {
    marginBottom: 12,
  },
  exchangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exchangeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  marketplaceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  marketplaceSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  categoryFilterScroll: {
    marginBottom: 14,
  },
  catFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  catFilterPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  catFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
