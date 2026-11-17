import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

// Define the shape of the user basic info object
export interface UserBasicInfo {
  language: string;
  cropType: string;
  landSize: number;
  location: string;
  locationCoordinates: {
    long: number;
    lati: number;
  };
  farmerName?: string;
  phone?: string;
}

export interface WeatherData {
  list: any[];
}

export interface CartItem {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  subsidyDiscount?: number;
}

export interface CropListingItem {
  id: string;
  cropName: string;
  cropNameHindi?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  quality: string;
  location: string;
  harvestDate: string;
  farmerName: string;
  phone: string;
  image: string;
  status: 'active' | 'sold';
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'COD' | 'KCC' | 'UPI';
  orderDate: string;
  deliveryStatus: 'Confirmed' | 'Dispatched' | 'Delivered';
  deliveryAddress: string;
}

interface StorageContextValue {
  userBasicInfo: UserBasicInfo | null;
  setUserBasicInfo: (data: UserBasicInfo) => void;
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData) => void;
  lastWeatherUpdate: string | null;
  setLastWeatherUpdate: (iso: string) => void;
  // AI Provider & Keys
  customGroqKey: string;
  setCustomGroqKey: (key: string) => void;
  customGeminiKey: string;
  setCustomGeminiKey: (key: string) => void;
  aiModelPreference: string;
  setAiModelPreference: (model: string) => void;
  // Store Cart
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Mandi Listings
  cropListings: CropListingItem[];
  addCropListing: (listing: Omit<CropListingItem, 'id' | 'createdAt' | 'status'>) => void;
  deleteCropListing: (id: string) => void;
  // Orders
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, 'id' | 'orderDate' | 'deliveryStatus'>) => OrderRecord;
}

export const StorageContext = createContext<StorageContextValue | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

const DEFAULT_CROP_LISTINGS: CropListingItem[] = [
  {
    id: 'listing-1',
    cropName: 'Basmati Rice (1121)',
    cropNameHindi: 'बासमती चावल (1121)',
    quantity: 60,
    unit: 'quintal',
    pricePerUnit: 3450,
    quality: 'Grade A (Export Quality)',
    harvestDate: '2026-11-10',
    location: 'Amritsar, Punjab',
    farmerName: 'सरदार गुरमीत सिंह',
    phone: '+91 98765 43210',
    image: '🌾',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'listing-2',
    cropName: 'Sharbati Wheat',
    cropNameHindi: 'शरबती गेहूं',
    quantity: 45,
    unit: 'quintal',
    pricePerUnit: 2450,
    quality: 'Premium Golden Grain',
    harvestDate: '2026-11-05',
    location: 'Karnal, Haryana',
    farmerName: 'राजेश यादव',
    phone: '+91 98123 45678',
    image: '🌾',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'listing-3',
    cropName: 'Organic Yellow Mustard',
    cropNameHindi: 'जैविक पीली सरसों',
    quantity: 25,
    unit: 'quintal',
    pricePerUnit: 5850,
    quality: 'High Oil Content (42%)',
    harvestDate: '2026-11-12',
    location: 'Bharatpur, Rajasthan',
    farmerName: 'महेन्द्र चौधरी',
    phone: '+91 94140 12345',
    image: '🌱',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const StorageProvider = ({ children }: StorageProviderProps) => {
  const [userBasicInfo, setUserBasicInfo] = useState<UserBasicInfo | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState<string | null>(null);

  // AI Keys & Config
  const [customGroqKey, setCustomGroqKey] = useState<string>('');
  const [customGeminiKey, setCustomGeminiKey] = useState<string>('');
  const [aiModelPreference, setAiModelPreference] = useState<string>('auto');

  // Store & Mandi
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cropListings, setCropListings] = useState<CropListingItem[]>(DEFAULT_CROP_LISTINGS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Load from persistent storage on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userBasicInfo");
        if (userData) setUserBasicInfo(JSON.parse(userData));

        const weather = await AsyncStorage.getItem("weatherData");
        if (weather) setWeatherData(JSON.parse(weather));

        const lastUpdate = await AsyncStorage.getItem("lastWeatherUpdate");
        if (lastUpdate) setLastWeatherUpdate(lastUpdate);

        const savedGroqKey = await AsyncStorage.getItem("customGroqKey");
        if (savedGroqKey) setCustomGroqKey(savedGroqKey);

        const savedGeminiKey = await AsyncStorage.getItem("customGeminiKey");
        if (savedGeminiKey) setCustomGeminiKey(savedGeminiKey);

        const savedModelPref = await AsyncStorage.getItem("aiModelPreference");
        if (savedModelPref) setAiModelPreference(savedModelPref);

        const savedCart = await AsyncStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));

        const savedListings = await AsyncStorage.getItem("cropListings");
        if (savedListings) {
          setCropListings(JSON.parse(savedListings));
        }

        const savedOrders = await AsyncStorage.getItem("orders");
        if (savedOrders) setOrders(JSON.parse(savedOrders));
      } catch (err) {
        console.warn('[StorageContext] Load data error:', err);
      }
    };
    loadData();
  }, []);

  // Save changes
  useEffect(() => {
    if (userBasicInfo) {
      AsyncStorage.setItem("userBasicInfo", JSON.stringify(userBasicInfo));
    }
  }, [userBasicInfo]);

  useEffect(() => {
    if (weatherData) {
      AsyncStorage.setItem("weatherData", JSON.stringify(weatherData));
      const now = new Date().toISOString();
      setLastWeatherUpdate(now);
      AsyncStorage.setItem("lastWeatherUpdate", now);
    }
  }, [weatherData]);

  useEffect(() => {
    if (lastWeatherUpdate) {
      AsyncStorage.setItem("lastWeatherUpdate", lastWeatherUpdate);
    }
  }, [lastWeatherUpdate]);

  useEffect(() => {
    AsyncStorage.setItem("customGroqKey", customGroqKey);
  }, [customGroqKey]);

  useEffect(() => {
    AsyncStorage.setItem("customGeminiKey", customGeminiKey);
  }, [customGeminiKey]);

  useEffect(() => {
    AsyncStorage.setItem("aiModelPreference", aiModelPreference);
  }, [aiModelPreference]);

  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem("cropListings", JSON.stringify(cropListings));
  }, [cropListings]);

  useEffect(() => {
    AsyncStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Cart operations
  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          nameHindi: product.nameHindi || product.name,
          category: product.category,
          price: product.price,
          unit: product.unit,
          quantity: quantity,
          image: product.image,
          subsidyDiscount: product.subsidyDiscount || 0,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Mandi Listings operations
  const addCropListing = (listing: Omit<CropListingItem, 'id' | 'createdAt' | 'status'>) => {
    const newListing: CropListingItem = {
      ...listing,
      id: `listing-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setCropListings((prev) => [newListing, ...prev]);
  };

  const deleteCropListing = (id: string) => {
    setCropListings((prev) => prev.filter((l) => l.id !== id));
  };

  // Orders operations
  const addOrder = (orderData: Omit<OrderRecord, 'id' | 'orderDate' | 'deliveryStatus'>): OrderRecord => {
    const newOrder: OrderRecord = {
      ...orderData,
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      deliveryStatus: 'Confirmed',
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  return (
    <StorageContext.Provider
      value={{
        userBasicInfo,
        setUserBasicInfo,
        weatherData,
        setWeatherData,
        lastWeatherUpdate,
        setLastWeatherUpdate,
        customGroqKey,
        setCustomGroqKey,
        customGeminiKey,
        setCustomGeminiKey,
        aiModelPreference,
        setAiModelPreference,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cropListings,
        addCropListing,
        deleteCropListing,
        orders,
        addOrder,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};
