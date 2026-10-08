import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.108.139.217:3000';

type Screen = 'home' | 'add' | 'listing' | 'offers' | 'orders' | 'buyer';
type UserRole = 'FARMER' | 'BUYER' | 'ADMIN' | 'LOGISTICS_PARTNER';
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
  unit?: string;
  priceFloor?: number | string;
  status?: string;
  locationName?: string;
};

const money = (value: any) => {
  if (value === null || value === undefined || value === '') return 'Not available';
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Not available';
  return `₹${number.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};


const getApiErrorMessage = (error: any, fallback: string) => {
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
  { id: 'catalog-rice', name: 'Rice', variety: 'Rice' },
  { id: 'catalog-wheat', name: 'Wheat', variety: 'Wheat' },
  { id: 'catalog-jowar', name: 'Jowar', variety: 'Sorghum' },
  { id: 'catalog-bajra', name: 'Bajra', variety: 'Pearl Millet' },
  { id: 'catalog-maize', name: 'Maize', variety: 'Yellow Maize' },
  { id: 'catalog-ragi', name: 'Ragi', variety: 'Finger Millet' },

  { id: 'catalog-tur', name: 'Tur', variety: 'Arhar / Pigeon Pea' },
  { id: 'catalog-gram', name: 'Gram', variety: 'Chickpea' },
  { id: 'catalog-moong', name: 'Moong', variety: 'Green Gram' },
  { id: 'catalog-urad', name: 'Urad', variety: 'Black Gram' },
  { id: 'catalog-masoor', name: 'Masoor', variety: 'Lentil' },
  { id: 'catalog-matki', name: 'Matki', variety: 'Moth Bean' },

  { id: 'catalog-soybean', name: 'Soybean', variety: 'Soybean' },
  { id: 'catalog-groundnut', name: 'Groundnut', variety: 'Peanut' },
  { id: 'catalog-sunflower', name: 'Sunflower', variety: 'Sunflower' },
  { id: 'catalog-sesame', name: 'Sesame', variety: 'Til' },
  { id: 'catalog-safflower', name: 'Safflower', variety: 'Kardi' },
  { id: 'catalog-castor', name: 'Castor', variety: 'Castor Seed' },

  { id: 'catalog-cotton', name: 'Cotton', variety: 'Cotton' },
  { id: 'catalog-sugarcane', name: 'Sugarcane', variety: 'Sugarcane' },

  { id: 'catalog-onion-red', name: 'Onion', variety: 'Red Onion' },
  { id: 'catalog-onion-white', name: 'Onion', variety: 'White Onion' },
  { id: 'catalog-potato', name: 'Potato', variety: 'Table Potato' },
  { id: 'catalog-tomato', name: 'Tomato', variety: 'Fresh Tomato' },
  { id: 'catalog-green-chilli', name: 'Chilli', variety: 'Green Chilli' },
  { id: 'catalog-dry-chilli', name: 'Chilli', variety: 'Dry Chilli' },
  { id: 'catalog-garlic', name: 'Garlic', variety: 'Garlic' },
  { id: 'catalog-ginger', name: 'Ginger', variety: 'Ginger' },
  { id: 'catalog-turmeric', name: 'Turmeric', variety: 'Turmeric' },
  { id: 'catalog-coriander', name: 'Coriander', variety: 'Coriander Seed' },
  { id: 'catalog-fenugreek', name: 'Fenugreek', variety: 'Methi' },

  { id: 'catalog-brinjal', name: 'Brinjal', variety: 'Eggplant' },
  { id: 'catalog-okra', name: 'Okra', variety: 'Bhindi' },
  { id: 'catalog-cabbage', name: 'Cabbage', variety: 'Cabbage' },
  { id: 'catalog-cauliflower', name: 'Cauliflower', variety: 'Cauliflower' },
  { id: 'catalog-green-peas', name: 'Green Peas', variety: 'Peas' },
  { id: 'catalog-cucumber', name: 'Cucumber', variety: 'Cucumber' },
  { id: 'catalog-carrot', name: 'Carrot', variety: 'Carrot' },
  { id: 'catalog-radish', name: 'Radish', variety: 'Radish' },
  { id: 'catalog-beetroot', name: 'Beetroot', variety: 'Beetroot' },
  { id: 'catalog-bottle-gourd', name: 'Bottle Gourd', variety: 'Lauki' },
  { id: 'catalog-bitter-gourd', name: 'Bitter Gourd', variety: 'Karela' },
  { id: 'catalog-pumpkin', name: 'Pumpkin', variety: 'Pumpkin' },

  { id: 'catalog-grapes', name: 'Grapes', variety: 'Table Grapes' },
  { id: 'catalog-pomegranate', name: 'Pomegranate', variety: 'Anar' },
  { id: 'catalog-banana', name: 'Banana', variety: 'Banana' },
  { id: 'catalog-mango', name: 'Mango', variety: 'Mango' },
  { id: 'catalog-orange', name: 'Orange', variety: 'Orange' },
  { id: 'catalog-mosambi', name: 'Mosambi', variety: 'Sweet Lime' },
  { id: 'catalog-guava', name: 'Guava', variety: 'Guava' },
  { id: 'catalog-papaya', name: 'Papaya', variety: 'Papaya' },
  { id: 'catalog-watermelon', name: 'Watermelon', variety: 'Watermelon' },
  { id: 'catalog-muskmelon', name: 'Muskmelon', variety: 'Muskmelon' },
  { id: 'catalog-custard-apple', name: 'Custard Apple', variety: 'Sitaphal' },
];

export default function App() {
  const [phone] = useState('+919876543210');
  const [password] = useState('Farmer@12345');

  const [token, setToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [dashboard, setDashboard] = useState<any>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const [quantity, setQuantity] = useState('');
  const [productionCost, setProductionCost] = useState('');
  const [transportCost, setTransportCost] = useState('');
  const [storageCost, setStorageCost] = useState('');
  const [packagingCost, setPackagingCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [desiredReturn, setDesiredReturn] = useState('');

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [cropLoadError, setCropLoadError] = useState('');
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [buyerDashboard, setBuyerDashboard] = useState<any>(null);
  const [buyerOffers, setBuyerOffers] = useState<any[]>([]);
  const [selectedBuyerListing, setSelectedBuyerListing] = useState<any>(null);
  const [buyerOfferPrice, setBuyerOfferPrice] = useState('');
  const [buyerOfferQuantity, setBuyerOfferQuantity] = useState('');
  const [buyerOfferMessage, setBuyerOfferMessage] = useState('');

  const [priceFloor, setPriceFloor] = useState<any>(null);
  const [fairPrice, setFairPrice] = useState<any>(null);
  const [sellDecision, setSellDecision] = useState<any>(null);
  const [bestMarket, setBestMarket] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const listings: Listing[] =
    dashboard?.produce?.listings ??
    dashboard?.produce?.activeListings ??
    [];

  const selectedListingId = selectedListing
    ? getListingId(selectedListing)
    : '';

  const selectedCropLabel = useMemo(() => {
    if (!selectedCrop) return 'No crop selected';
    return `${selectedCrop.name}${selectedCrop.variety ? ` - ${selectedCrop.variety}` : ''}`;
  }, [selectedCrop]);

  useEffect(() => {
    if (token && screen === 'add') {
      loadCrops(token);
    }
  }, [token, screen]);

  const authHeaders = (jwt = token!) => ({
    Authorization: `Bearer ${jwt}`,
  });

  const login = async () => {
    try {
      setLoading(true);
      setLoginError('');

      const response = await axios.post(`${API_URL}/auth/login`, {
        phone,
        password,
      });

      const jwt =
        response.data?.accessToken ??
        response.data?.token ??
        response.data?.access_token;

      if (!jwt) throw new Error('JWT token not found');

      const meResponse = await axios.get(API_URL + '/auth/me', { headers: authHeaders(jwt) });
      const serverRole = meResponse.data?.user?.role as UserRole;
      if (!serverRole) throw new Error('Server did not return a user role');
      setUserRole(serverRole);
      setToken(jwt);
      if (serverRole === 'FARMER') {
        await Promise.all([loadDashboard(jwt), loadCrops(jwt)]);
      } else if (serverRole === 'BUYER') {
        await loadBuyerDashboard(jwt);
        await loadBuyerOffers(jwt);
        setScreen('buyer');
      } else {
        throw new Error('This mobile app currently supports Farmer and Buyer accounts.');
      }
    } catch (error: any) {
      console.log('LOGIN ERROR:', error?.response?.data ?? error);
      setLoginError(
        getApiErrorMessage(error, 'Unable to connect to PikMoolya backend.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerDashboard = async (jwt = token!) => {
    const response = await axios.get(API_URL + '/buyer-dashboard', { headers: authHeaders(jwt), timeout: 10000 });
    setBuyerDashboard(response.data);
  };

  const loadBuyerOffers = async (jwt = token!) => {
    const response = await axios.get(API_URL + '/offers/my', { headers: authHeaders(jwt), timeout: 10000 });
    setBuyerOffers(Array.isArray(response.data) ? response.data : response.data?.offers ?? []);
  };

  const createBuyerOffer = async () => {
    if (!selectedBuyerListing || !buyerOfferPrice) {
      Alert.alert('Offer details needed', 'Enter an offer price before submitting.'); return;
    }
    try {
      setLoading(true);
      await axios.post(API_URL + '/offers', {
        listingId: selectedBuyerListing.listingId,
        quantity: buyerOfferQuantity ? Number(buyerOfferQuantity) : Number(selectedBuyerListing.quantity),
        offeredPricePerUnit: Number(buyerOfferPrice),
        deliveryTerms: buyerOfferMessage || undefined,
      }, { headers: authHeaders() });
      Alert.alert('Offer submitted', 'Your offer has been sent to the farmer.');
      setBuyerOfferPrice(''); setBuyerOfferQuantity(''); setBuyerOfferMessage(''); setSelectedBuyerListing(null);
      await loadBuyerOffers();
    } catch (error: any) {
      Alert.alert('Offer failed', getApiErrorMessage(error, 'Unable to submit the offer.'));
    } finally { setLoading(false); }
  };

  const loadDashboard = async (jwt: string) => {
    try {
      console.log('LOADING FARMER DASHBOARD FROM:', `${API_URL}/farmer-dashboard`);

      const response = await axios.get(`${API_URL}/farmer-dashboard`, {
        headers: authHeaders(jwt),
        timeout: 10000,
      });

      console.log('DASHBOARD STATUS:', response.status);
      console.log('DASHBOARD RESPONSE:', JSON.stringify(response.data, null, 2));

      const raw = response.data;

      const dashboardData =
        raw?.data ??
        raw?.dashboard ??
        raw;

      const produceData = dashboardData?.produce ?? {};

      const activeListings =
        produceData?.activeListings ??
        produceData?.listings ??
        produceData?.items ??
        [];

      const normalizedDashboard = {
        ...dashboardData,
        produce: {
          ...produceData,
          activeListings: Array.isArray(activeListings)
            ? activeListings
            : [],
          listings: Array.isArray(produceData?.listings)
            ? produceData.listings
            : Array.isArray(activeListings)
              ? activeListings
              : [],
          totalListings:
            produceData?.totalListings ??
            (Array.isArray(activeListings) ? activeListings.length : 0),
        },
      };

      console.log(
        'MY PRODUCE LISTINGS:',
        JSON.stringify(normalizedDashboard.produce.activeListings, null, 2),
      );

      console.log(
        'MY PRODUCE COUNT:',
        normalizedDashboard.produce.activeListings.length,
      );

      setDashboard(normalizedDashboard);
    } catch (error: any) {
      console.log('DASHBOARD ERROR:', error?.response?.data ?? error);

      if (error?.response) {
        console.log('DASHBOARD ERROR STATUS:', error.response.status);
      }

      Alert.alert(
        'Could not load dashboard',
        getApiErrorMessage(
          error,
          'Unable to load your farmer dashboard.',
        ),
      );
    }
  };

  const loadCrops = async (jwt: string) => {
    try {
      setCropsLoading(true);
      setCropLoadError('');

      console.log('LOADING CROPS FROM:', `${API_URL}/crops`);

      const response = await axios.get(`${API_URL}/crops`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        timeout: 10000,
      });

      console.log('CROPS STATUS:', response.status);
      console.log('CROPS API RESPONSE:', response.data);

      const raw = response.data;

      const data: Crop[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.crops)
              ? raw.crops
              : [];

      const validCrops = data.filter(
        (crop: any) => crop && typeof crop.id === 'string' && crop.name,
      );

      /*
       * Show the Maharashtra crop catalog in the selector.
       * When the same crop/variety exists in PostgreSQL, keep its
       * real database UUID so existing backend functionality continues
       * to work normally.
       */
      const apiByKey = new Map<string, Crop>();

      validCrops.forEach((crop: Crop) => {
        const key =
          `${crop.name.trim().toLowerCase()}|${(crop.variety ?? '').trim().toLowerCase()}`;
        apiByKey.set(key, crop);
      });

      const mergedCatalog = MAHARASHTRA_CROP_CATALOG.map((catalogCrop) => {
        const key =
          `${catalogCrop.name.trim().toLowerCase()}|${(catalogCrop.variety ?? '').trim().toLowerCase()}`;

        return apiByKey.get(key) ?? catalogCrop;
      });

      const apiOnlyCrops = validCrops.filter((apiCrop) => {
        const key =
          `${apiCrop.name.trim().toLowerCase()}|${(apiCrop.variety ?? '').trim().toLowerCase()}`;

        return !MAHARASHTRA_CROP_CATALOG.some(
          (catalogCrop) =>
            `${catalogCrop.name.trim().toLowerCase()}|${(catalogCrop.variety ?? '').trim().toLowerCase()}` === key,
        );
      });

      const mergedCrops = [...mergedCatalog, ...apiOnlyCrops];

      setCrops(mergedCrops);

      setSelectedCrop((current) => {
        if (
          current &&
          mergedCrops.some((crop: Crop) => crop.id === current.id)
        ) {
          return current;
        }

        return mergedCrops[0] ?? null;
      });
    } catch (error: any) {
      console.log('CROPS ERROR:', error?.response?.data ?? error);

      setCrops(MAHARASHTRA_CROP_CATALOG);
      setSelectedCrop((current) => current ?? MAHARASHTRA_CROP_CATALOG[0]);

      const status = error?.response?.status;
      const serverMessage = getApiErrorMessage(error, '');

      let message = serverMessage || error?.message || 'Unknown error';

      if (status === 401) {
        message = 'Your login session is invalid or expired. Please login again.';
      } else if (status === 403) {
        message = 'You are not allowed to access the crop list.';
      } else if (status === 404) {
        message = 'The /crops API endpoint was not found on the backend.';
      } else if (!error?.response) {
        message =
          'The phone cannot reach the PikMoolya API at ' +
          `${API_URL}. Make sure the phone and PC are on the same Wi-Fi and the backend is running.`;
      }

      setCropLoadError(message);

      Alert.alert('Could not load crops', message);
    } finally {
      setCropsLoading(false);
    }
  };

  const refreshHome = async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      await loadDashboard(token);
      await loadCrops(token);
    } finally {
      setRefreshing(false);
    }
  };

  const clearProduceForm = () => {
    setQuantity('');
    setProductionCost('');
    setTransportCost('');
    setStorageCost('');
    setPackagingCost('');
    setOtherCost('');
    setDesiredReturn('');
    setSelectedCrop(crops[0] ?? null);
    setCropDropdownOpen(false);
    setPriceFloor(null);
    setFairPrice(null);
    setSellDecision(null);
    setBestMarket(null);
  };

  const calculatePriceFloor = async () => {
    if (!productionCost) {
      Alert.alert('Missing information', 'Enter your production cost.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/price-floor/calculate`,
        {
          productionCostPerUnit: Number(productionCost),
          transportCostPerUnit: Number(transportCost || 0),
          storageCostPerUnit: Number(storageCost || 0),
          packagingCostPerUnit: Number(packagingCost || 0),
          otherCostPerUnit: Number(otherCost || 0),
          desiredMinReturnPerUnit: Number(desiredReturn || 0),
        },
        { headers: authHeaders() },
      );

      setPriceFloor(response.data);
    } catch (error: any) {
      console.log('PRICE FLOOR ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Price floor failed',
        getApiErrorMessage(error, 'Could not calculate the price floor.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateFairPrice = async () => {
    if (!selectedCrop) {
      Alert.alert('Select a crop', 'Select a crop first.');
      return;
    }

    if (selectedCrop.id.startsWith('catalog-')) {
      Alert.alert(
        'Crop database update needed',
        `${selectedCrop.name}${selectedCrop.variety ? ` - ${selectedCrop.variety}` : ''} is available in the new crop selector, but it is not yet stored in the backend crop database. The UI is ready; the database crop master will be connected next.`,
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/fair-price/calculate`,
        {
          cropId: selectedCrop.id,
          quantity: Number(quantity || 0),
        },
        { headers: authHeaders() },
      );

      setFairPrice(response.data);
    } catch (error: any) {
      console.log('FAIR PRICE ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Fair price failed',
        getApiErrorMessage(error, 'Could not calculate fair price.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateSellDecision = async () => {
    if (!selectedCrop || !quantity) {
      Alert.alert(
        'Missing information',
        'Select a crop and enter quantity first.',
      );
      return;
    }

    const currentPrice =
      fairPrice?.fairPrice ??
      fairPrice?.marketReference ??
      fairPrice?.marketReferencePrice;

    if (!currentPrice) {
      Alert.alert(
        'Fair price needed',
        'Calculate the fair price first so PikMoolya can compare selling now vs waiting.',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/sell-decision/calculate`,
        {
          cropId: selectedCrop.id,
          quantity: Number(quantity),
          currentPrice: Number(currentPrice),
          waitDays: 7,
        },
        { headers: authHeaders() },
      );

      setSellDecision(response.data);
    } catch (error: any) {
      console.log('SELL DECISION ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Sell decision failed',
        getApiErrorMessage(error, 'Could not calculate sell now vs wait.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateBestMarket = async () => {
    if (!selectedCrop || !quantity) {
      Alert.alert(
        'Missing information',
        'Select a crop and enter quantity first.',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/market-optimizer/best-market`,
        {
          cropId: selectedCrop.id,
          quantity: Number(quantity),
          transportCostPerUnit: Number(transportCost || 0),
          otherCostPerUnit: Number(otherCost || 0),
        },
        { headers: authHeaders() },
      );

      setBestMarket(response.data);
    } catch (error: any) {
      console.log('MARKET ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Market comparison failed',
        getApiErrorMessage(error, 'Could not compare markets.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const createProduce = async () => {
    if (!selectedCrop) {
      Alert.alert('Select a crop', 'Please select the produce you want to sell.');
      return;
    }

    if (!quantity) {
      Alert.alert('Missing information', 'Enter the quantity.');
      return;
    }

    if (!productionCost) {
      Alert.alert(
        'Missing information',
        'Enter your production cost per quintal.',
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/produce`,
        {
          cropId: selectedCrop.id,
          quantity: Number(quantity),
          unit: 'quintal',
          productionCostPerUnit: Number(productionCost),
          transportCostPerUnit: Number(transportCost || 0),
          storageCostPerUnit: Number(storageCost || 0),
          packagingCostPerUnit: Number(packagingCost || 0),
          otherCostPerUnit: Number(otherCost || 0),
          desiredMinReturnPerUnit: Number(desiredReturn || 0),
        },
        { headers: authHeaders() },
      );

      const listingId =
        response.data?.listingId ??
        response.data?.id ??
        response.data?.listing?.id;

      Alert.alert(
        'Produce created',
        listingId
          ? 'Your produce listing was created. Now PikMoolya can calculate your selling decision.'
          : 'Your produce listing was created successfully.',
      );

      if (listingId) {
        const listing: Listing = {
          listingId,
          crop: selectedCrop,
          quantity: Number(quantity),
          unit: 'quintal',
          status: 'DRAFT',
        };
        setSelectedListing(listing);
      }

      await loadDashboard(token!);
      setScreen('home');
      clearProduceForm();
    } catch (error: any) {
      console.log('CREATE PRODUCE ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not create produce',
        getApiErrorMessage(error, 'Something went wrong while creating the listing.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const publishSelectedListing = async () => {
    if (!selectedListingId) return;

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/produce/${selectedListingId}/publish`,
        {},
        { headers: authHeaders() },
      );

      Alert.alert('Listing published', 'Your produce is now available for selling.');
      await loadDashboard(token!);
      setScreen('home');
    } catch (error: any) {
      console.log('PUBLISH ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not publish listing',
        getApiErrorMessage(error, 'The listing could not be published.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const openListing = async (listing: Listing) => {
    const id = getListingId(listing);
    if (!id) return;

    setSelectedListing(listing);
    setPriceFloor(null);
    setFairPrice(null);
    setSellDecision(null);
    setBestMarket(null);
    setOffers([]);

    const crop = listing.crop ?? crops.find((item) => item.id === listing.cropId);
    if (crop) setSelectedCrop(crop);

    setScreen('listing');

    try {
      setDetailLoading(true);

      const response = await axios.get(`${API_URL}/produce/${id}`, {
        headers: authHeaders(),
      });

      setSelectedListing(response.data);
    } catch (error: any) {
      console.log('LISTING ERROR:', error?.response?.data ?? error);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadOffers = async () => {
  if (!selectedListingId) {
    Alert.alert('Listing needed', 'Open a produce listing first.');
    return;
  }

  try {
    setDetailLoading(true);

    console.log('OFFERS LISTING ID:', selectedListingId);

    const response = await axios.get(
      `${API_URL}/offers/listing/${selectedListingId}`,
      { headers: authHeaders() },
    );

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.offers ?? [];

    setOffers(data);
    setScreen('offers');
  } catch (error: any) {
    console.log('OFFERS ERROR:', error?.response?.data ?? error);
    Alert.alert(
      'Could not load offers',
      getApiErrorMessage(error, 'Unable to load buyer offers.'),
    );
  } finally {
    setDetailLoading(false);
  }
};

  const acceptOffer = async (offerId: string) => {
    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/offers/${offerId}/accept`,
        {},
        { headers: authHeaders() },
      );

      Alert.alert(
        'Offer accepted',
        'The offer is accepted. The next step is order creation.',
      );

      await loadOffers();
      await loadDashboard(token!);
    } catch (error: any) {
      console.log('ACCEPT OFFER ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not accept offer',
        getApiErrorMessage(error, 'The offer could not be accepted.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async (offerId: string) => {
    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/offers/${offerId}/reject`,
        {},
        { headers: authHeaders() },
      );

      await loadOffers();
    } catch (error: any) {
      console.log('REJECT OFFER ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not reject offer',
        getApiErrorMessage(error, 'The offer could not be rejected.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setDetailLoading(true);

      const response = await axios.get(`${API_URL}/orders/my`, {
        headers: authHeaders(),
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders ?? [];

      setOrders(data);
      setScreen('orders');
    } catch (error: any) {
      console.log('ORDERS ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not load orders',
        getApiErrorMessage(error, 'Unable to load your orders.'),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);

      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        { headers: authHeaders() },
      );

      await loadOrders();
    } catch (error: any) {
      console.log('ORDER STATUS ERROR:', error?.response?.data ?? error);
      Alert.alert(
        'Could not update order',
        getApiErrorMessage(error, 'The order status could not be updated.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPriceTools = () => (
    <View style={styles.toolsCard}>
      <Text style={styles.sectionTitle}>PikMoolya selling tools</Text>
      <Text style={styles.sectionHint}>
        These calculations are decision support. They are not guaranteed prices.
      </Text>

      <View style={styles.toolGrid}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={calculatePriceFloor}
        >
          <Text style={styles.toolTitle}>Price Floor</Text>
          <Text style={styles.toolSubtitle}>Protect your minimum</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={calculateFairPrice}
        >
          <Text style={styles.toolTitle}>Fair Price</Text>
          <Text style={styles.toolSubtitle}>Know the market reference</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={calculateSellDecision}
        >
          <Text style={styles.toolTitle}>Sell vs Wait</Text>
          <Text style={styles.toolSubtitle}>Compare scenarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={calculateBestMarket}
        >
          <Text style={styles.toolTitle}>Best Market</Text>
          <Text style={styles.toolSubtitle}>Compare effective net</Text>
        </TouchableOpacity>
      </View>

      {priceFloor ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>YOUR PRICE FLOOR</Text>
          <Text style={styles.resultPrice}>
            {money(priceFloor.priceFloor)}
          </Text>
          <Text style={styles.resultText}>
            Total cost: {money(priceFloor.totalCost)}
          </Text>
          <Text style={styles.resultText}>
            {priceFloor.explanation ?? 'Based on your costs and desired return.'}
          </Text>
        </View>
      ) : null}

      {fairPrice ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>AI FAIR PRICE</Text>
          <Text style={styles.resultPrice}>{money(fairPrice.fairPrice)}</Text>
          <Text style={styles.resultText}>
            Fair range:{' '}
            {fairPrice.fairRange
              ? `${money(fairPrice.fairRange.lower)} - ${money(fairPrice.fairRange.upper)}`
              : 'Not available'}
          </Text>
          <Text style={styles.resultText}>
            Market reference: {money(fairPrice.marketReference?.modalPrice ?? fairPrice.marketReference)}
          </Text>
          <Text style={styles.disclaimer}>
            {fairPrice.disclaimer ??
              'AI recommendation, not a guaranteed transaction price.'}
          </Text>
        </View>
      ) : null}

      {sellDecision ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>SELL NOW VS WAIT</Text>
          <Text style={styles.recommendation}>
            {sellDecision.recommendation ?? 'Review scenarios'}
          </Text>

          <View style={styles.scenarioRow}>
            <View style={styles.scenarioBox}>
              <Text style={styles.scenarioLabel}>Pessimistic</Text>
              <Text style={styles.scenarioValue}>
                {money(sellDecision.scenarios?.pessimistic)}
              </Text>
            </View>

            <View style={styles.scenarioBox}>
              <Text style={styles.scenarioLabel}>Expected</Text>
              <Text style={styles.scenarioValue}>
                {money(sellDecision.scenarios?.expected)}
              </Text>
            </View>

            <View style={styles.scenarioBox}>
              <Text style={styles.scenarioLabel}>Optimistic</Text>
              <Text style={styles.scenarioValue}>
                {money(sellDecision.scenarios?.optimistic)}
              </Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            {sellDecision.disclaimer ??
              'Scenario estimate only. Actual prices can differ.'}
          </Text>
        </View>
      ) : null}

      {bestMarket ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>BEST MARKET</Text>
          <Text style={styles.resultPrice}>
            {bestMarket.bestMarket?.marketName ??
              bestMarket.bestMarket?.market ??
              bestMarket.bestMarketName ??
              'Review markets'}
          </Text>
          <Text style={styles.resultText}>
            Effective net:{' '}
            {money(
              bestMarket.bestMarket?.effectiveNetPrice ??
                bestMarket.effectiveNetPrice,
            )}
          </Text>
          <Text style={styles.disclaimer}>
            {bestMarket.disclaimer ??
              'Net value considers market price and your entered costs.'}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderHome = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHome}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>PikMoolya</Text>
            <Text style={styles.tagline}>
              Know the best way to sell.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setToken(null);
              setDashboard(null);
              setSelectedListing(null);
              setScreen('home');
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.greetingTitle}>Namaste, Farmer</Text>
        <Text style={styles.greetingSubtitle}>
          Your selling dashboard
        </Text>

        <View style={styles.fairPriceCard}>
          <Text style={styles.cardLabel}>TODAY'S FAIR PRICE</Text>
          <Text style={styles.price}>
            {money(dashboard?.today?.fairPrice)}
          </Text>
          <Text style={styles.unit}>per unit</Text>

          <View style={styles.rangeBox}>
            <Text style={styles.rangeLabel}>Market reference</Text>
            <Text style={styles.rangeValue}>
              {money(dashboard?.today?.marketReference)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Produce</Text>
          <Text style={styles.countText}>
            {dashboard?.produce?.totalListings ?? listings.length}
          </Text>
        </View>

        {listings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>+</Text>
            <Text style={styles.emptyTitle}>No active produce</Text>
            <Text style={styles.emptyText}>
              Add your produce to start using PikMoolya's selling tools.
            </Text>
          </View>
        ) : (
          listings.map((listing, index) => (
            <TouchableOpacity
              key={getListingId(listing) || String(index)}
              style={styles.listingCard}
              onPress={() => openListing(listing)}
            >
              <View style={styles.listingMain}>
                <Text style={styles.listingName}>
                  {listing.crop?.name ?? 'Produce'}
                </Text>

                {listing.crop?.variety ? (
                  <Text style={styles.listingVariety}>
                    {listing.crop.variety}
                  </Text>
                ) : null}

                <Text style={styles.quantity}>
                  {Number(listing.quantity ?? 0)} {listing.unit ?? 'quintal'}
                </Text>

                {listing.status ? (
                  <Text style={styles.statusText}>
                    {listing.status}
                  </Text>
                ) : null}
              </View>

              <View style={styles.listingRight}>
                <Text style={styles.listingFloor}>
                  {money(listing.priceFloor)}
                </Text>
                <Text style={styles.floorLabel}>price floor</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            clearProduceForm();
            setScreen('add');
          }}
        >
          <Text style={styles.addButtonText}>+ Add New Produce</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Selling</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              if (listings[0]) {
                openListing(listings[0]);
              } else {
                Alert.alert('No listing', 'Add produce first.');
              }
            }}
          >
            <Text style={styles.statNumber}>
              {dashboard?.selling?.activeOffers?.length ?? 0}
            </Text>
            <Text style={styles.statLabel}>Active Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={loadOrders}
          >
            <Text style={styles.statNumber}>
              {orders.length}
            </Text>
            <Text style={styles.statLabel}>Orders</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>PikMoolya AI</Text>
          <Text style={styles.infoText}>
            Compare fair price, your price floor, buyers and markets before
            deciding how to sell.
          </Text>
        </View>

        {renderBottomNav()}
      </ScrollView>
    </SafeAreaView>
  );

  const renderAdd = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity onPress={() => { setCropDropdownOpen(false); setScreen('home'); }}>
          <Text style={styles.backText}>‹ Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Add Your Produce</Text>
        <Text style={styles.pageSubtitle}>
          Tell PikMoolya what you want to sell.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Select your crop</Text>

          {cropsLoading ? (
            <View style={styles.cropLoading}>
              <ActivityIndicator />
              <Text style={styles.unitText}>Loading crops...</Text>
            </View>
          ) : crops.length === 0 ? (
            <View style={styles.noCropBox}>
              <Text style={styles.errorText}>No crops available</Text>
              <Text style={styles.cropErrorDetail}>
                {cropLoadError || 'PikMoolya could not load the crop list yet.'}
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => token && loadCrops(token)}
              >
                <Text style={styles.secondaryButtonText}>
                  Retry Loading Crops
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownSelectedRow}
                activeOpacity={0.8}
                onPress={() => setCropDropdownOpen((open) => !open)}
              >
                <View style={styles.dropdownOptionContent}>
                  <Text style={styles.dropdownSelectedText}>
                    {selectedCrop ? selectedCrop.name : 'Select a crop'}
                  </Text>
                  {selectedCrop?.variety ? (
                    <Text style={styles.dropdownSelectedVariety}>
                      {selectedCrop.variety}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.dropdownArrow}>
                  {cropDropdownOpen ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={cropDropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setCropDropdownOpen(false)}
              >
                <View style={styles.cropModalOverlay}>
                  <View style={styles.cropModalCard}>
                    <View style={styles.cropModalHeader}>
                      <View>
                        <Text style={styles.cropModalTitle}>Select your crop</Text>
                        <Text style={styles.cropModalSubtitle}>
                          Maharashtra crops & varieties
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.cropModalClose}
                        onPress={() => setCropDropdownOpen(false)}
                      >
                        <Text style={styles.cropModalCloseText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={styles.cropModalList}
                      contentContainerStyle={styles.cropModalListContent}
                      showsVerticalScrollIndicator
                      nestedScrollEnabled
                    >
                      {crops.map((crop: Crop) => {
                        const isSelected = selectedCrop?.id === crop.id;

                        return (
                          <TouchableOpacity
                            key={crop.id}
                            style={[
                              styles.modalCropOption,
                              isSelected && styles.modalCropOptionSelected,
                            ]}
                            activeOpacity={0.75}
                            onPress={() => {
                              setSelectedCrop(crop);
                              setCropDropdownOpen(false);
                            }}
                          >
                            <View style={styles.dropdownOptionContent}>
                              <Text
                                style={[
                                  styles.dropdownOptionName,
                                  isSelected &&
                                    styles.dropdownOptionNameSelected,
                                ]}
                              >
                                {crop.name}
                              </Text>

                              {crop.variety ? (
                                <Text
                                  style={[
                                    styles.dropdownOptionVariety,
                                    isSelected &&
                                      styles.dropdownOptionVarietySelected,
                                  ]}
                                >
                                  {crop.variety}
                                </Text>
                              ) : null}
                            </View>

                            {isSelected ? (
                              <View style={styles.selectedCheckCircle}>
                                <Text style={styles.dropdownCheck}>✓</Text>
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          )}

          <View style={styles.selectedCropBox}>
            <Text style={styles.selectedCropLabel}>Selected crop</Text>
            <Text style={styles.cropPreview}>{selectedCropLabel}</Text>
          </View>

          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Example: 20"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={styles.unitText}>Unit: quintal</Text>

          <Text style={styles.formSectionTitle}>Your costs per quintal</Text>

          <Text style={styles.inputLabel}>Production cost</Text>
          <TextInput
            value={productionCost}
            onChangeText={setProductionCost}
            placeholder="Example: 1800"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Transport cost</Text>
          <TextInput
            value={transportCost}
            onChangeText={setTransportCost}
            placeholder="Example: 100"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Storage cost</Text>
          <TextInput
            value={storageCost}
            onChangeText={setStorageCost}
            placeholder="Example: 30"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Packaging cost</Text>
          <TextInput
            value={packagingCost}
            onChangeText={setPackagingCost}
            placeholder="Example: 20"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Other cost</Text>
          <TextInput
            value={otherCost}
            onChangeText={setOtherCost}
            placeholder="Example: 10"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Desired minimum return</Text>
          <TextInput
            value={desiredReturn}
            onChangeText={setDesiredReturn}
            placeholder="Example: 250"
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Price Floor Protection</Text>
            <Text style={styles.infoText}>
              Your price floor is calculated from your costs and desired
              minimum return. It is a decision aid, not a forced selling price.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={calculatePriceFloor}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.secondaryButtonText}>
                Calculate Price Floor
              </Text>
            )}
          </TouchableOpacity>

          {priceFloor ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>PRICE FLOOR</Text>
              <Text style={styles.resultPrice}>
                {money(priceFloor.priceFloor)}
              </Text>
              <Text style={styles.resultText}>
                Total cost: {money(priceFloor.totalCost)}
              </Text>
              <Text style={styles.resultText}>
                {priceFloor.explanation ?? 'Calculated from your entered costs.'}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={createProduce}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Create Produce Listing
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderListing = () => {
    const crop = selectedListing?.crop ?? selectedCrop;
    const quantityValue = Number(selectedListing?.quantity ?? quantity ?? 0);

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <TouchableOpacity onPress={() => { setCropDropdownOpen(false); setScreen('home'); }}>
            <Text style={styles.backText}>‹ Back to Dashboard</Text>
          </TouchableOpacity>

          {detailLoading ? (
            <ActivityIndicator />
          ) : null}

          <Text style={styles.pageTitle}>
            {crop?.name ?? 'Produce'}
          </Text>

          <Text style={styles.pageSubtitle}>
            {crop?.variety ?? 'Your produce selling workspace'}
          </Text>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>QUANTITY</Text>
            <Text style={styles.detailValue}>
              {quantityValue} {selectedListing?.unit ?? 'quintal'}
            </Text>

            <Text style={styles.detailLabel}>STATUS</Text>
            <Text style={styles.detailValue}>
              {selectedListing?.status ?? 'Draft'}
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={calculatePriceFloor}
            >
              <Text style={styles.secondaryButtonText}>
                Calculate / Refresh Price Floor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={calculateFairPrice}
            >
              <Text style={styles.primaryButtonText}>
                Calculate AI Fair Price
              </Text>
            </TouchableOpacity>

            {selectedListing?.status === 'DRAFT' ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={publishSelectedListing}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  Publish Listing
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={loadOffers}
            >
              <Text style={styles.secondaryButtonText}>
                View Buyer Offers
              </Text>
            </TouchableOpacity>
          </View>

          {renderPriceTools()}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What PikMoolya will do next</Text>
            <Text style={styles.infoText}>
              Fair price → price floor → sell now vs wait → best market →
              buyer matching → offers → negotiation → order → delivery quality.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderOffers = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity onPress={() => setScreen('listing')}>
          <Text style={styles.backText}>‹ Back to Produce</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Buyer Offers</Text>
        <Text style={styles.pageSubtitle}>
          Compare effective net value, not only the raw offer.
        </Text>

        {detailLoading ? <ActivityIndicator /> : null}

        {offers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptyText}>
              Buyer offers will appear here when buyers respond to your listing.
            </Text>
          </View>
        ) : (
          offers.map((offer, index) => (
            <View key={offer.id ?? String(index)} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerBuyer}>
                  {offer.buyer?.name ??
                    offer.buyerName ??
                    'Buyer'}
                </Text>
                <Text style={styles.offerStatus}>
                  {offer.status ?? 'PENDING'}
                </Text>
              </View>

              <Text style={styles.offerPrice}>
                {money(offer.offeredPricePerUnit)}
                <Text style={styles.offerUnit}> / unit</Text>
              </Text>

              <Text style={styles.resultText}>
                Effective net: {money(offer.effectiveNetPerUnit)}
              </Text>

              {offer.transportCostPerUnit !== undefined ? (
                <Text style={styles.resultText}>
                  Transport: {money(offer.transportCostPerUnit)}
                </Text>
              ) : null}

              {offer.estimatedRiskCostPerUnit !== undefined ? (
                <Text style={styles.resultText}>
                  Risk estimate: {money(offer.estimatedRiskCostPerUnit)}
                </Text>
              ) : null}

              {offer.status === 'PENDING' ? (
                <View style={styles.offerActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptOffer(offer.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectOffer(offer.id)}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderBuyer = () => {
    const produce = buyerDashboard?.produce ?? [];
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View><Text style={styles.greetingTitle}>Buyer Dashboard</Text><Text style={styles.greetingSubtitle}>Find produce and negotiate directly with farmers.</Text></View>
            <TouchableOpacity onPress={() => { setToken(null); setUserRole(null); }}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Available Produce</Text>
          {produce.map((item: any) => (
            <View key={item.listingId} style={styles.listingCard}>
              <View style={styles.listingMain}><Text style={styles.listingName}>{item.crop?.name ?? 'Produce'}</Text><Text style={styles.quantity}>{item.quantity} {item.unit ?? ''}</Text><Text style={styles.quantity}>{item.location ?? 'Location unavailable'}</Text><Text style={styles.statusText}>{item.quality?.message ?? 'Quality verification pending'}</Text></View>
              <TouchableOpacity style={styles.acceptButton} onPress={() => setSelectedBuyerListing(item)}><Text style={styles.acceptButtonText}>Make Offer</Text></TouchableOpacity>
            </View>
          ))}
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>My Offers</Text>
          {buyerOffers.map((offer: any) => <View key={offer.id} style={styles.offerCard}><Text style={styles.offerBuyer}>Offer</Text><Text style={styles.offerPrice}>{money(offer.offeredPricePerUnit)} / unit</Text><Text style={styles.offerStatus}>{offer.status ?? 'PENDING'}</Text></View>)}
          {selectedBuyerListing ? (
            <View style={styles.loginCard}>
              <Text style={styles.pageTitle}>Make an Offer</Text>
              <Text style={styles.quantity}>{selectedBuyerListing.crop?.name} · Available {selectedBuyerListing.quantity} {selectedBuyerListing.unit}</Text>
              <Text style={styles.inputLabel}>Offer price per unit</Text><TextInput value={buyerOfferPrice} onChangeText={setBuyerOfferPrice} keyboardType="numeric" style={styles.input} placeholder="Example: 2400" />
              <Text style={styles.inputLabel}>Quantity</Text><TextInput value={buyerOfferQuantity} onChangeText={setBuyerOfferQuantity} keyboardType="numeric" style={styles.input} placeholder={String(selectedBuyerListing.quantity ?? '')} />
              <Text style={styles.inputLabel}>Delivery terms</Text><TextInput value={buyerOfferMessage} onChangeText={setBuyerOfferMessage} style={styles.input} placeholder="Pickup from farm" />
              <TouchableOpacity style={styles.primaryButton} onPress={createBuyerOffer} disabled={loading}><Text style={styles.primaryButtonText}>{loading ? 'Submitting...' : 'Submit Offer'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelectedBuyerListing(null)}><Text style={styles.secondaryButtonText}>Cancel</Text></TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  };

  const renderOrders = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity onPress={() => { setCropDropdownOpen(false); setScreen('home'); }}>
          <Text style={styles.backText}>‹ Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>My Orders</Text>
        <Text style={styles.pageSubtitle}>
          Track accepted deals through delivery.
        </Text>

        {detailLoading ? <ActivityIndicator /> : null}

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Accepted deals that become orders will appear here.
            </Text>
          </View>
        ) : (
          orders.map((order, index) => (
            <View key={order.id ?? String(index)} style={styles.orderCard}>
              <Text style={styles.orderCrop}>
                {order.listing?.crop?.name ??
                  order.crop?.name ??
                  'Produce'}
              </Text>

              <Text style={styles.resultText}>
                Quantity: {Number(order.quantity ?? 0)}{' '}
                {order.listing?.unit ?? 'quintal'}
              </Text>

              <Text style={styles.orderPrice}>
                {money(order.agreedPricePerUnit)} / unit
              </Text>

              <Text style={styles.orderStatus}>
                {order.status ?? 'PENDING'}
              </Text>

              <Text style={styles.resultText}>
                Expected gross: {money(order.expectedGross)}
              </Text>

              <Text style={styles.resultText}>
                Expected net: {money(order.expectedNet)}
              </Text>

              {order.status === 'PENDING' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    updateOrderStatus(order.id, 'CONFIRMED')
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Confirm Order
                  </Text>
                </TouchableOpacity>
              ) : null}

              {order.status === 'CONFIRMED' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    updateOrderStatus(order.id, 'PICKUP_SCHEDULED')
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Schedule Pickup
                  </Text>
                </TouchableOpacity>
              ) : null}

              {order.status === 'PICKUP_SCHEDULED' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    updateOrderStatus(order.id, 'IN_TRANSIT')
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Mark In Transit
                  </Text>
                </TouchableOpacity>
              ) : null}

              {order.status === 'IN_TRANSIT' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    updateOrderStatus(order.id, 'DELIVERED')
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Mark Delivered
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => { setCropDropdownOpen(false); setScreen('home'); }}>
        <Text style={screen === 'home' ? styles.navActive : styles.navText}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (listings[0]) openListing(listings[0]);
          else setScreen('add');
        }}
      >
        <Text style={screen === 'listing' ? styles.navActive : styles.navText}>
          Produce
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          if (selectedListing) loadOffers();
          else if (listings[0]) openListing(listings[0]).then(() => {});
          else Alert.alert('No listing', 'Add produce first.');
        }}
      >
        <Text style={screen === 'offers' ? styles.navActive : styles.navText}>
          Offers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={loadOrders}>
        <Text style={screen === 'orders' ? styles.navActive : styles.navText}>
          Orders
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.loginContainer}>
          <Text style={styles.logo}>PikMoolya</Text>

          <Text style={styles.loginTitle}>
            Sell smarter. Earn better.
          </Text>

          <Text style={styles.loginSubtitle}>
            Your produce. Your price floor. Your decision.
          </Text>

          <View style={styles.loginCard}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              value={phone}
              editable={true}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              editable={false}
              secureTextEntry
              style={styles.input}
            />

            {loginError ? (
              <Text style={styles.errorText}>{loginError}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={login}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Enter PikMoolya
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.demoText}>Sign in with your registered Farmer or Buyer account.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'buyer' || userRole === 'BUYER') return renderBuyer();
  if (screen === 'add') return renderAdd();
  if (screen === 'listing') return renderListing();
  if (screen === 'offers') return renderOffers();
  if (screen === 'orders') return renderOrders();

  return renderHome();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F4',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#176B3A',
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    color: '#68736C',
  },
  loginTitle: {
    marginTop: 45,
    fontSize: 29,
    fontWeight: '800',
    color: '#17221B',
  },
  loginSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6D776F',
  },
  loginCard: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: '700',
    color: '#37443B',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D9E1DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#17221B',
    backgroundColor: '#FAFCFA',
  },
  unitText: {
    marginTop: 5,
    fontSize: 11,
    color: '#7A837D',
  },
  formSectionTitle: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '800',
    color: '#26342B',
  },
  noCropBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
  },
  cropErrorDetail: {
    marginTop: 8,
    marginBottom: 12,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
  },

  primaryButton: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: 13,
    backgroundColor: '#176B3A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#176B3A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#176B3A',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 12,
  },
  demoText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 11,
    color: '#8A938D',
  },
  backText: {
    color: '#176B3A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#17221B',
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6D776F',
    marginBottom: 18,
  },
  formCard: {
    marginTop: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  cropLoading: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  dropdownContainer: {
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D9E1DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownSelectedRow: {
    minHeight: 62,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26342B',
  },
  dropdownSelectedVariety: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  dropdownArrow: {
    marginLeft: 12,
    fontSize: 15,
    color: '#176B3A',
    fontWeight: '800',
  },
  dropdownOptions: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8E3',
    maxHeight: 300,
  },
  cropModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cropModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '82%',
    overflow: 'hidden',
  },
  cropModalHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#26342B',
  },
  cropModalSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  cropModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F6F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropModalCloseText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#526057',
  },
  cropModalList: {
    maxHeight: 520,
  },
  cropModalListContent: {
    padding: 10,
    paddingBottom: 18,
  },
  modalCropOption: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF2EF',
    backgroundColor: '#FFFFFF',
  },
  modalCropOptionSelected: {
    backgroundColor: '#EEF6EF',
    borderColor: '#A9C9B0',
  },
  selectedCheckCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#176B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOption: {
    minHeight: 55,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownOptionSelected: {
    backgroundColor: '#EEF6EF',
  },
  dropdownOptionContent: {
    flex: 1,
  },
  dropdownOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26342B',
  },
  dropdownOptionNameSelected: {
    color: '#176B3A',
  },
  dropdownOptionVariety: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  dropdownOptionVarietySelected: {
    color: '#176B3A',
  },
  dropdownCheck: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '800',
    color: '#176B3A',
  },
  cropList: {
    marginTop: 10,
    gap: 8,
  },
  cropOption: {
    borderWidth: 1,
    borderColor: '#D9E1DB',
    borderRadius: 12,
    padding: 13,
    backgroundColor: '#FAFCFA',
  },
  cropOptionSelected: {
    borderWidth: 2,
    borderColor: '#176B3A',
    backgroundColor: '#EEF6EF',
  },
  cropOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26342B',
  },
  cropOptionNameSelected: {
    color: '#176B3A',
  },
  cropOptionVariety: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  selectedCropBox: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#F1F6F1',
    padding: 13,
  },
  selectedCropLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737D76',
    textTransform: 'uppercase',
  },
  cropPreview: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#26342B',
  },
  infoBox: {
    marginTop: 18,
    backgroundColor: '#EEF6EF',
    borderRadius: 13,
    padding: 14,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#176B3A',
  },
  infoText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#657068',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  logoutText: {
    color: '#176B3A',
    fontSize: 12,
    fontWeight: '700',
  },
  greetingTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#17221B',
  },
  greetingSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#6D776F',
    marginBottom: 18,
  },
  fairPriceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#758078',
    letterSpacing: 0.7,
  },
  price: {
    marginTop: 15,
    fontSize: 40,
    fontWeight: '800',
    color: '#176B3A',
  },
  unit: {
    fontSize: 13,
    color: '#68736C',
  },
  rangeBox: {
    marginTop: 18,
    backgroundColor: '#F1F6F1',
    borderRadius: 12,
    padding: 13,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#69756D',
  },
  rangeValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    color: '#26352B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17221B',
  },
  sectionHint: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#737D76',
  },
  countText: {
    fontSize: 12,
    color: '#176B3A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyEmoji: {
    fontSize: 38,
    color: '#176B3A',
    fontWeight: '700',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: '#26342B',
  },
  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 12,
    color: '#737D76',
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingMain: {
    flex: 1,
    paddingRight: 10,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#202B24',
  },
  listingVariety: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  quantity: {
    marginTop: 6,
    fontSize: 12,
    color: '#717B74',
  },
  statusText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#176B3A',
  },
  listingRight: {
    alignItems: 'flex-end',
  },
  listingFloor: {
    fontSize: 17,
    fontWeight: '800',
    color: '#176B3A',
  },
  floorLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#7A837D',
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#176B3A',
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 22,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 17,
  },
  statNumber: {
    fontSize: 27,
    fontWeight: '800',
    color: '#176B3A',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#737D76',
  },
  toolsCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  toolGrid: {
    marginTop: 12,
    gap: 10,
  },
  toolButton: {
    borderWidth: 1,
    borderColor: '#D9E1DB',
    borderRadius: 13,
    padding: 13,
    backgroundColor: '#FAFCFA',
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#176B3A',
  },
  toolSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#737D76',
  },
  resultCard: {
    marginTop: 14,
    backgroundColor: '#F1F6F1',
    borderRadius: 14,
    padding: 15,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D776F',
    letterSpacing: 0.6,
  },
  resultPrice: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: '#176B3A',
  },
  resultText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#59645D',
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 10,
    lineHeight: 15,
    color: '#737D76',
  },
  recommendation: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: '800',
    color: '#176B3A',
  },
  scenarioRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  scenarioBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 9,
  },
  scenarioLabel: {
    fontSize: 9,
    color: '#737D76',
  },
  scenarioValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: '#26342B',
  },
  detailCard: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  detailLabel: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: '800',
    color: '#7A837D',
  },
  detailValue: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: '800',
    color: '#26342B',
  },
  offerCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offerBuyer: {
    fontSize: 15,
    fontWeight: '800',
    color: '#26342B',
  },
  offerStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#176B3A',
  },
  offerPrice: {
    marginTop: 14,
    fontSize: 25,
    fontWeight: '800',
    color: '#176B3A',
  },
  offerUnit: {
    fontSize: 11,
    color: '#737D76',
    fontWeight: '500',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#176B3A',
    borderRadius: 11,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D9E1DB',
    borderRadius: 11,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#B42318',
    fontWeight: '800',
  },
  orderCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
  },
  orderCrop: {
    fontSize: 17,
    fontWeight: '800',
    color: '#26342B',
  },
  orderPrice: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '800',
    color: '#176B3A',
  },
  orderStatus: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#176B3A',
  },
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#176B3A',
  },
  navText: {
    fontSize: 11,
    color: '#7A837D',
  },
});








