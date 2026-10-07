import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { config } from '../config';
import { initFacebookPixels } from '../pixel';

export const OrderContext = createContext();
let orderInitialCache = null;
let orderInitialInFlight = null;
let allProductsCache = null;

export const OrderProvider = ({ children }) => {
  const apiUrl = config.apiUrl;
  const imageUrl = config.imageUrl;
  
  // All state variables
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [homepage, setHomepage] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pixel, setPixel] = useState(null);
  const [filterAllProducts, setAllFilterProducts] = useState([]);
  const [products, setProducts] = useState({ 
    images: [], 
    colors: [],
    name: '',
    price: 0,
    discount_price: null,
    clothing: 0,
    bumps: [] 
  });

   // District related states
   const [districts, setDistricts] = useState([]);
   const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা');
   const [estimatedDays, setEstimatedDays] = useState('3-5');
   const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedBulkDiscount, setSelectedBulkDiscount] = useState(null);
  const [autoAppliedDiscount, setAutoAppliedDiscount] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
   

  // Fetch delivery charges and pixel
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true); // Ensure loading is true when starting
      if (orderInitialCache) {
        setPixel(orderInitialCache.pixel);
        setDistricts(orderInitialCache.districts);
        if (orderInitialCache.defaultDistrict) {
          setSelectedDistrict(orderInitialCache.defaultDistrict.district_name);
          setDeliveryCharge(orderInitialCache.defaultDistrict.delivery_charge);
          setEstimatedDays(orderInitialCache.defaultDistrict.estimated_days);
          setDeliveryNote(orderInitialCache.defaultDistrict.delivery_note || '');
        }
        setLoading(false);
        return;
      }

      if (!orderInitialInFlight) {
        orderInitialInFlight = Promise.all([
          axios.get(`${apiUrl}/pixels`),
          axios.get(`${apiUrl}/deliverycharges`)
        ]).finally(() => {
          orderInitialInFlight = null;
        });
      }
      const [pixelsResponse, districtsRes] = await orderInitialInFlight;
      setPixel(pixelsResponse.data.pixels?.map((p)=>p.pixel_id) || '');
      setDistricts(districtsRes.data);
      
      // Set default district
      const defaultDistrict = districtsRes.data.find(d => d.district_name.includes('ঢাকা')) || districtsRes.data[0];
      if (defaultDistrict) {
        setSelectedDistrict(defaultDistrict.district_name);
        setDeliveryCharge(defaultDistrict.delivery_charge);
        setEstimatedDays(defaultDistrict.estimated_days);
        setDeliveryNote(defaultDistrict.delivery_note || '');
      }
      orderInitialCache = {
        pixel: pixelsResponse.data.pixels?.map((p)=>p.pixel_id) || '',
        districts: districtsRes.data,
        defaultDistrict,
      };
      setLoading(false); // Set loading to false when done
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false); // Ensure loading is false even on error
      if (error.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchInitialData();
      }
    }
  }, [apiUrl]);

  const fetchProductDetails = useCallback(async (slug) => {
    try {
      setLoading(true); // Set loading when starting
      setProductNotFound(false);
      const productPromise = axios.get(`${apiUrl}/products/${slug}`);
      const allProductsPromise = allProductsCache
        ? Promise.resolve({ data: allProductsCache })
        : axios.get(`${apiUrl}/products`).then((res) => {
            allProductsCache = res.data || [];
            return res;
          });
      const [productResponse, allProductsResponse] = await Promise.all([
        productPromise,
        allProductsPromise
      ]);

      const productData = productResponse.data;
      const allProducts = allProductsResponse.data;
      const categoryId = productData.category_id;

      const relatedProducts = allProducts.filter(
        (product) => product.category_id === categoryId && product.id !== productData.id
      );

      setProducts(productData);
      setHomepage(productData.homepage);
      setAllFilterProducts(relatedProducts);

      // Set default color and image if available
      if (productData?.colors?.length > 0) {
        const firstColor = productData.colors[0];
        setSelectedColor(firstColor.color);
        setCurrentImage(firstColor.image);
        setSelectedColorId(firstColor.id);
      }
      setLoading(false); // Set loading to false when done
    } catch (err) {
      console.error('Error fetching product details:', err);
      if (err.response?.status === 404) {
        setProductNotFound(true);
      }
      setLoading(false); // Ensure loading is false even on error
      if (err.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchProductDetails(slug);
      }
    }
  }, [apiUrl]);

  // Initialize all data
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle color selection
  const handleColorSelect = (color, image, colorId) => {
    setSelectedColor(color);
    setCurrentImage(image);
    setSelectedColorId(colorId);
    setSelectedSize('');
  };

  // Handle quantity change
  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const calculatePrices = ({ useCoins = false, coinsToUse = 0 } = {}) => {
    const selectedDistrictData = districts.find(d => d.district_name === selectedDistrict);
    
    const currentDeliveryCharge = selectedDistrictData 
      ? parseFloat(selectedDistrictData.delivery_charge) 
      : 0;
  
    const basePrice = (products.discount_price ? products.discount_price : products.price) * quantity;
  
    const bumpsTotal = products?.bumps?.filter(b => b.selected)
      .reduce((sum, bump) => sum + Number(bump.bump_price), 0);
  
    // Bulk Discount
    let appliedDiscount = null;
    const bulkDiscount = products?.bulk_discounts?.length > 0
      ? (() => {
          const found = products.bulk_discounts.find(d => quantity === d.offer_quantity);
          appliedDiscount = found;
          return found ? Math.floor((basePrice * found.discount_percentage) / 100) : 0;
        })()
      : 0;
  
    // Coin Discount
    const coinsDiscount = useCoins ? coinsToUse : 0;
  
    const totalPrice = Math.floor(basePrice + bumpsTotal - bulkDiscount - coinsDiscount + currentDeliveryCharge);
  
    if (selectedDistrictData) {
      setDeliveryCharge(currentDeliveryCharge);
      setEstimatedDays(selectedDistrictData.estimated_days);
      setDeliveryNote(selectedDistrictData.delivery_note || '');
    }
  
    return {
      basePrice,
      bumpsTotal,
      bulkDiscount,
      coinsDiscount,
      totalPrice,
      appliedDiscount,
      deliveryCharge: currentDeliveryCharge,
      estimatedDays: selectedDistrictData?.estimated_days || '3-5',
      deliveryNote: selectedDistrictData?.delivery_note || ''
    };
  };
  


const handleBulkDiscountSelect = (discount) => {
  setSelectedBulkDiscount(discount);
  // Automatically set quantity to the required amount
  setQuantity(discount.offer_quantity);
};

// Handle district change
const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    calculatePrices(); // Recalculate prices when district changes
};

// Add a function to handle bump selection
const handleBumpSelect = useCallback((bumpId) => {
  setProducts(prev => {
    const updatedBumps = prev.bumps.map(bump => 
      bump.id === bumpId ? {...bump, selected: !bump.selected} : bump
    );
    return {...prev, bumps: updatedBumps};
  });
}, []);

  // Initialize Facebook Pixel when available
  useEffect(() => {
    if (pixel) {
      initFacebookPixels([pixel]);
    }
  }, [pixel]);

  return (
    <OrderContext.Provider
      value={{
        apiUrl,
        imageUrl,
        loading,
        products,
        selectedColor,
        selectedColorId,
        selectedSize,
        quantity,
        currentImage,
        name,
        address,
        phone,
        homepage,
        deliveryCharge,
        setDeliveryCharge,
        pixel,
        filterAllProducts,
        setName,
        setAddress,
        setPhone,
        setSelectedSize,
        handleColorSelect,
        handleQuantityChange,
        calculatePrices,
        handleDistrictChange,
        districts,
        selectedDistrict,
        estimatedDays,
        deliveryNote,
        selectedBulkDiscount,
        handleBulkDiscountSelect,
        autoAppliedDiscount,
        setAutoAppliedDiscount,
        productNotFound,
        handleBumpSelect,
        fetchProductDetails,
        setSelectedDistrict,
        setEstimatedDays

      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
