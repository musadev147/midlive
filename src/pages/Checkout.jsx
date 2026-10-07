import React, { useContext, useEffect, useState } from 'react';
import { useCart } from 'react-use-cart';
import { FaShoppingCart, FaTruck, FaFlask, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { OrderContext } from '../context/OrderContext';
import bdLocations from './locations';
import axios from 'axios';
import { initFacebookPixels, trackEventOnMultiplePixels } from '../pixel';
import { gtmBeginCheckout } from '../utils/gtm';
import { ProductContext } from '../context/ProductsContext';
import CheckoutDelivery from '../components/OrderPage/CheckoutDelivery';
import { buildImageUrl, handleImageFallback } from '../utils/image';

const CHECKOUT_FORM_STORAGE_KEY = 'medivila_checkout_shipping_form';
const BANGLA_DIGIT_MAP = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const normalizePhoneNumber = (phoneNumber = '') => {
  const asciiDigits = String(phoneNumber)
    .replace(/[০-৯]/g, (digit) => BANGLA_DIGIT_MAP[digit] || digit)
    .replace(/[^\d]/g, '');

  if (asciiDigits.startsWith('880') && asciiDigits.length === 13) {
    return `0${asciiDigits.slice(3)}`;
  }

  return asciiDigits;
};

const isValidBangladeshiPhoneNumber = (phoneNumber = '') =>
  /^01[3-9]\d{8}$/.test(normalizePhoneNumber(phoneNumber));

const Checkout = () => {
  const { isEmpty, items, emptyCart, updateItemQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const token = localStorage.getItem('authToken') || null;
  const [bonus, setBonus] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [isCheckoutFormHydrated, setIsCheckoutFormHydrated] = useState(false);

  const {
    apiUrl,
    imageUrl,
    name,
    address,
    phone,
    deliveryCharge,
    setDeliveryCharge,
    estimatedDays,
    setEstimatedDays,
    selectedDistrict,
    setSelectedDistrict,
    deliveryNote,
    setName,
    setAddress,
    setPhone,
    districts: districtData,
  } = useContext(OrderContext);

  const { pixel } = useContext(ProductContext);

  const ensureNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const getItemImage = (item) => {
    if (item?.type === 'lab_test') {
      return item?.image || item?.product_image || null;
    }

    if (item?.image) return item.image;
    if (item?.product_image) return item.product_image;
    if (Array.isArray(item?.images) && item.images.length > 0) {
      return item.images[0]?.image || null;
    }

    return null;
  };

  const handleUpdateQuantity = (item, nextQuantity) => {
    if (nextQuantity < 1) {
      removeItem(item.id);
      return;
    }

    updateItemQuantity(item.id, nextQuantity);
  };

  const regularProducts = items.filter((item) => item.type !== 'lab_test');
  const labTests = items.filter((item) => item.type === 'lab_test');

  const regularProductsTotal = regularProducts.reduce((total, item) => {
    return total + ensureNumber(item.price) * (item.quantity || 1);
  }, 0);

  const labTestsTotal = labTests.reduce((total, item) => {
    return total + ensureNumber(item.price) * (item.quantity || item.patientCount || 1);
  }, 0);

  const safeCartTotal = regularProductsTotal + labTestsTotal;
  const safeDeliveryCharge = ensureNumber(deliveryCharge);
  const hasRegularProducts = regularProducts.length > 0;
  const hasLabTests = labTests.length > 0;
  const applicableDeliveryCharge = hasRegularProducts ? safeDeliveryCharge : 0;
  const safeTotal = safeCartTotal + applicableDeliveryCharge;

  const handleDistrictChange = (districtName) => {
    const districtInfo = districtData.find((d) => d.district_name === districtName);
    if (districtInfo) {
      setDeliveryCharge(Number(districtInfo.delivery_charge) || 0);
      setEstimatedDays(districtInfo.estimated_days);
    }
    setSelectedDistrictName(districtName);
    setSelectedDistrict(districtName);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const savedForm = window.localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      if (savedForm) {
        const parsedForm = JSON.parse(savedForm);

        if (parsedForm?.name) setName(parsedForm.name);
        if (parsedForm?.phone) setPhone(normalizePhoneNumber(parsedForm.phone));
        if (parsedForm?.address) setAddress(parsedForm.address);

        if (parsedForm?.selectedDivisionName) {
          setSelectedDivisionName(parsedForm.selectedDivisionName);
        }

        if (parsedForm?.selectedDivision) {
          setSelectedDivision(parsedForm.selectedDivision);
        } else if (parsedForm?.selectedDivisionName) {
          setSelectedDivision(parsedForm.selectedDivisionName);
        }

        if (parsedForm?.selectedDistrictName) {
          setSelectedDistrictName(parsedForm.selectedDistrictName);
        }
      }
    } catch (error) {
      console.error('Failed to restore checkout form:', error);
    } finally {
      setIsCheckoutFormHydrated(true);
    }
  }, [setAddress, setName, setPhone, setSelectedDivision, setSelectedDivisionName, setSelectedDistrictName]);

  useEffect(() => {
    if (!isCheckoutFormHydrated || typeof window === 'undefined') {
      return;
    }

    const payload = {
      name,
      phone: normalizePhoneNumber(phone),
      address,
      selectedDivision,
      selectedDivisionName,
      selectedDistrictName,
    };

    const hasSavedValue = Object.values(payload).some(
      (value) => typeof value === 'string' && value.trim() !== ''
    );

    try {
      if (hasSavedValue) {
        window.localStorage.setItem(
          CHECKOUT_FORM_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } else {
        window.localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save checkout form:', error);
    }
  }, [
    address,
    isCheckoutFormHydrated,
    name,
    phone,
    selectedDistrictName,
    selectedDivision,
    selectedDivisionName,
  ]);

  const formatPhoneForFacebook = (phoneNumber) => {
    if (!phoneNumber) return '';
    const digitsOnly = normalizePhoneNumber(phoneNumber);
    if (digitsOnly.length === 11 && !digitsOnly.startsWith('880')) {
      return `880${digitsOnly.substring(1)}`;
    }
    return digitsOnly;
  };

  useEffect(() => {
    if (pixel.length > 0) {
      initFacebookPixels(pixel);

      trackEventOnMultiplePixels(pixel, 'InitiateCheckout', {
        content_ids: items.map((item) => String(item.id)),
        content_type: 'product',
        num_items: items.reduce(
          (total, item) => total + (item.quantity || item.patientCount || 1),
          0
        ),
        value: safeTotal,
        currency: 'BDT',
      });
    }

    if (items.length > 0) {
      gtmBeginCheckout(items, safeTotal);
    }
  }, [pixel, safeTotal, items]);

  const trackPurchaseEvent = async (orderId) => {
    const formattedPhone = formatPhoneForFacebook(phone);
    const totalPrice = safeTotal;

    const contentIds = items.map((item) => String(item.id));

    const productsData = items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity || item.patientCount || 1,
      item_price: ensureNumber(item.price),
      type: item.type || 'product',
    }));

    const eventData = {
      email: localStorage.getItem('email') || '',
      phone: formattedPhone,
      name: name,
      city: selectedDistrictName,
      state: selectedDivisionName,
      value: totalPrice,
      currency: 'BDT',
      content_name: 'Checkout Purchase',
      content_ids: contentIds,
      contents: productsData,
      content_type: 'product',
      event_source_url: window.location.href,
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
      event_id: orderId,
      external_id: formattedPhone,
    };

    try {
      trackEventOnMultiplePixels(pixel, 'Purchase', eventData);

      await axios.post(`${apiUrl}/fb-track`, {
        event: 'Purchase',
        ...eventData,
      });
    } catch (err) {
      console.error('Facebook Pixel tracking failed:', err);
    }
  };

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const response = await axios.get(`${apiUrl}/bonuscoins`);
        setBonus(response?.data?.[0]);
      } catch (err) {
        console.error('Error fetching bonuses:', err);
      }
    };

    fetchBonuses();
  }, [apiUrl]);

  useEffect(() => {
    const loadedDivisions = bdLocations.map((div) => ({
      id: div.division.en,
      name: div.division.en,
      bn_name: div.division.bn,
    }));
    setDivisions(loadedDivisions);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      const selectedDivData = bdLocations.find(
        (div) => div.division.en === selectedDivision
      );

      if (selectedDivData) {
        const loadedDistricts = selectedDivData.districts.map((dist) => ({
          id: dist.en,
          name: dist.en,
          bn_name: dist.bn,
        }));
        setDistricts(loadedDistricts);
      }
    } else {
      setDistricts([]);
    }
  }, [selectedDivision]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasRegularProducts && !selectedDistrictName) {
      alert('ডেলিভারি চার্জ দেখতে জেলা সিলেক্ট করুন');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!name || !normalizedPhone) {
      alert('নাম এবং মোবাইল নম্বর দিন');
      return;
    }

    if (!isValidBangladeshiPhoneNumber(normalizedPhone)) {
      alert('সঠিক বাংলাদেশি মোবাইল নম্বর দিন');
      return;
    }

    const orderId = `A2C${Math.floor(1000 + Math.random() * 90000)}`;
    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => {
        if (item.type === 'lab_test') {
          return {
            type: 'lab_test',
            lab_test_id: item.testId || item.id,
            lab_id: item.labId || null,
            lab_test_name: item.name,
            lab_name: item.labName || null,
            image: getItemImage(item),
            report_time: item.reportTime || null,
            price: ensureNumber(item.price),
            patient_count: item.quantity || item.patientCount || 1,
            total_price: ensureNumber(item.price) * (item.quantity || item.patientCount || 1),
            discount: item.discount || null,
            rating: item.rating || null,
          };
        }

        return {
          type: 'product',
          product_id: item.product_id || item.id,
          product_name: item.name,
          image: getItemImage(item),
          product_image: getItemImage(item),
          quantity: item.quantity || 1,
          price: ensureNumber(item.price),
          color: item.color || null,
          size: item.size || null,
        };
      });

      const primaryLabTest = hasLabTests ? labTests[0] : null;

      const orderData = {
        order_id: orderId,
        order_type: hasLabTests && !hasRegularProducts
          ? 'lab_test'
          : hasLabTests && hasRegularProducts
            ? 'mixed'
            : 'product',

        customer_name: name,
        phone_number: normalizedPhone,
        customer_address: hasRegularProducts
          ? `Village/Road: ${address}, District: ${selectedDistrictName}, Division: ${selectedDivisionName}`
          : 'Lab Test Booking - Phone Consultation',

        product_name: hasRegularProducts
          ? regularProducts.map((item) => item.name).join(', ')
          : null,

        quantity: hasRegularProducts
          ? regularProducts.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : 1,

        // optional summary fields
        lab_test_name: primaryLabTest ? primaryLabTest.name : null,
        lab_name: primaryLabTest ? primaryLabTest.labName : null,
        patient_count: primaryLabTest ? primaryLabTest.quantity || primaryLabTest.patientCount || 1 : null,
        report_time: primaryLabTest ? primaryLabTest.reportTime || null : null,
        lab_test_image: primaryLabTest ? primaryLabTest.image || null : null,

        delivery_charge: applicableDeliveryCharge,
        product_price: hasRegularProducts ? regularProductsTotal : labTestsTotal,
        subtotal: safeCartTotal,
        lab_tests_total: labTestsTotal,
        regular_products_total: regularProductsTotal,
        total: safeTotal,

        payment_method: 'cod',
        delivery_note: deliveryNote || null,
        delivery_status: 'New Order',
        has_lab_tests: hasLabTests,
        has_regular_products: hasRegularProducts,

        items: orderItems,
      };


      await axios.post(`${apiUrl}/cartstore`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },

      });

      try {
        await trackPurchaseEvent(orderId);
      } catch (trackingError) {
        console.error('Tracking failed:', trackingError);
      }

      setIsRedirecting(true);
      emptyCart();
      navigate(`/thankyou/${orderId}`, { replace: true });
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error.message);

      let errorMessage = 'অর্ডার সাবমিশন ব্যর্থ হয়েছে';

      if (error.response) {
        if (error.response.data.message === 'Insufficient coins') {
          errorMessage = `আপনার পর্যাপ্ত ${bonus?.name || 'বোনাস'} নেই`;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join('\n');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'সার্ভারে রেসপন্স দিতে দেরি হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন';
      }

      alert(errorMessage);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16 text-center">
          <div className="rounded-2xl bg-white p-10 shadow-md">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              আপনার অর্ডার প্রসেস হচ্ছে
            </h2>
            <p className="mt-2 text-gray-600">
              অনুগ্রহ করে অপেক্ষা করুন, আপনাকে ধন্যবাদ পেজে নেওয়া হচ্ছে।
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="hidden lg:block bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="mt-2 text-lg hidden lg:block">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            / Checkout
          </p>
        </div>

        <main className="max-w-4xl mx-auto py-16 px-4 text-center">
          <div className="bg-white rounded-xl shadow-md p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              আপনার কার্ট খালি
            </h2>
            <p className="text-gray-600 mb-6">
              অর্ডার করতে আগে কিছু প্রোডাক্ট বা ল্যাব টেস্ট যোগ করুন।
            </p>
            <Link
              to="/"
              className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              শপিং চালিয়ে যান
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-1 lg:py-8 text-center text-white">
        <h1 className="text-md lg:text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-lg hidden lg:block">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          / Checkout
        </p>
      </div>

      <main className="container  mx-auto py-6 pb-28 sm:px-6 lg:px-8 lg:pb-6">
        <div className="px-4 sm:px-0">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-6">
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-[14px] lg:text-lg leading-6 font-medium text-gray-900">
                    Order Summary
                  </h3>
                </div>
                <div className="flow-root">
                  <ul className="-my-4 divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.id} className="flex py-4 px-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          {item.type === 'lab_test' ? (
                            getItemImage(item) ? (
                              <img
                                src={getItemImage(item)}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                                onError={handleImageFallback}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                <FaFlask className="text-2xl text-blue-600" />
                              </div>
                            )
                          ) : item.images && item.images.length > 0 ? (
                            <img
                              src={buildImageUrl(imageUrl, item.images[0]?.image)}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                              onError={handleImageFallback}
                            />
                          ) : item.image || item.product_image ? (
                            <img
                              src={buildImageUrl(imageUrl, item.image || item.product_image)}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                              onError={handleImageFallback}
                            />
                          ) : null}
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="text-sm font-medium">
                                {item.name}
                                {item.type === 'lab_test' && (
                                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                    Lab Test
                                  </span>
                                )}
                              </h3>

                              <p className="ml-4 text-sm font-medium">
                                ৳
                                {item.type === 'lab_test'
                                  ? (
                                    ensureNumber(item.price) * (item.quantity || item.patientCount || 1)
                                  ).toFixed(2)
                                  : (
                                    ensureNumber(item.price) * (item.quantity || 1)
                                  ).toFixed(2)}
                              </p>
                            </div>

                            {item.type === 'lab_test' ? (
                              <>
                                <p className="mt-1 text-xs text-gray-500">
                                  Lab: {item.labName}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Patients: {item.quantity || item.patientCount || 1}
                                </p>
                                <p className="mt-1 text-xs text-green-600">
                                  Report in {item.reportTime}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="mt-1 text-sm text-gray-500">
                                  ৳{ensureNumber(item.price)} per piece
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.color || ''} {item.size || ''}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="mt-2 flex flex-1 items-end justify-between gap-3 text-sm mb-1">
                            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item, (item.quantity || item.patientCount || 1) - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Decrease quantity"
                                disabled={(item.quantity || item.patientCount || 1) <= 1}
                              >
                                <FaMinus className="text-xs" />
                              </button>

                              <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">
                                {item.quantity || item.patientCount || 1}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item, (item.quantity || item.patientCount || 1) + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                                aria-label="Increase quantity"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                              aria-label="Remove item"
                            >
                              <FaTrash className="text-xs" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-2 sm:px-6">
                  <h3 className="text-[14px] lg:text-lg leading-6 font-medium text-gray-900">
                    Shipping Address
                  </h3>
                </div>

                <div className="px-4 pb-5 sm:p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-lg border text-sm border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="পূর্ণ নাম লিখুন"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-sm rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="01XXXXXXXXX"
                          required
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-lg border text-sm border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="বিস্তারিত ঠিকানা (থানা, গ্রাম/রোড)"
                          required
                        />
                      </div>

                      {hasRegularProducts && (
                        <div className="flex space-x-3 w-full mb-4">
                          <div className="relative flex-1">
                            <select
                              value={selectedDivisionName}
                              onChange={(e) => {
                                const selectedOption =
                                  e.target.options[e.target.selectedIndex];
                                setSelectedDivision(selectedOption.id);
                                setSelectedDivisionName(selectedOption.value);
                                setSelectedDistrictName('');
                              }}
                              className="w-full text-sm appearance-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={hasRegularProducts}
                            >
                              <option value="">বিভাগ সিলেক্ট করুন</option>
                              {divisions.map((division) => (
                                <option
                                  key={division.id}
                                  id={division.id}
                                  value={division.name}
                                >
                                  {division.bn_name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>

                          <div className="relative flex-1">
                            <select
                              value={selectedDistrictName}
                              onChange={(e) => setSelectedDistrictName(e.target.value)}
                              className="w-full text-sm appearance-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={!selectedDivision}
                              required={hasRegularProducts}
                            >
                              <option value="">জেলা সিলেক্ট করুন</option>
                              {districts.map((district) => (
                                <option key={district.id} value={district.name}>
                                  {district.bn_name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {!hasRegularProducts && hasLabTests && (
                        <div className="rounded-lg bg-blue-50 p-4">
                          <div className="flex items-center gap-2">
                            <FaFlask className="text-xl text-blue-600" />
                            <p className="text-sm text-blue-700">
                              ল্যাব টেস্টের জন্য শুধুমাত্র ফোন নম্বর এবং নাম প্রয়োজন। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {hasRegularProducts && (
                <CheckoutDelivery handleDistrictChange={handleDistrictChange} />
              )}

              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-4 sm:p-6">
                  <div>
                    {labTestsTotal > 0 && (
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-600">Lab Test Total:</span>
                        <span className="font-bold text-blue-600">
                          ৳{labTestsTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {regularProductsTotal > 0 && (
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-gray-600">Product Total:</span>
                        <span className="font-bold">
                          ৳{regularProductsTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>৳{safeCartTotal.toFixed(2)}</p>
                    </div>

                    {hasRegularProducts && (
                      <div className="mb-2 mt-2 flex items-center justify-between">
                        <span className="text-gray-600">
                          ডেলিভারি চার্জ ({selectedDistrict || selectedDistrictName}):
                        </span>
                        <span
                          className={`font-bold ${applicableDeliveryCharge === 0 ? 'text-green-600' : ''}`}
                        >
                          {applicableDeliveryCharge === 0
                            ? 'ফ্রি'
                            : `৳${applicableDeliveryCharge.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {!hasRegularProducts && hasLabTests && (
                      <div className="mb-2 mt-2 flex items-center justify-between">
                        <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                        <span className="font-bold text-green-600">ফ্রি (ল্যাব টেস্ট)</span>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between text-lg font-bold text-gray-900">
                      <p>সর্বমোট</p>
                      <p>৳{safeTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {hasRegularProducts && (
                    <div className="mt-6 flex items-center text-sm text-gray-500">
                      <FaTruck className="mr-2 flex-shrink-0 text-blue-500" />
                      <p>
                        {selectedDistrictName
                          ? `${selectedDistrictName}-এ আনুমানিক ডেলিভারি সময়: ${estimatedDays || '5-7'} কার্যদিবস`
                          : 'ডেলিভারি সময় জেলা নির্বাচন করার পরে দেখানো হবে'}
                      </p>
                    </div>
                  )}

                  {hasLabTests && (
                    <div className="mt-6 flex items-start rounded-lg bg-blue-50 p-3 text-sm text-gray-500">
                      <FaFlask className="mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                      <p>
                        ল্যাব টেস্টের জন্য হোম স্যাম্পল কালেকশন সুবিধা রয়েছে। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
                      </p>
                    </div>
                  )}

                  <div className="mt-6 fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:static lg:inset-auto lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                    <div className="mx-auto w-full max-w-7xl lg:max-w-none">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting || (hasRegularProducts && !selectedDistrictName)}
                      className={`flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white shadow-sm transition duration-200 hover:bg-green-700 ${isSubmitting || (hasRegularProducts && !selectedDistrictName)
                        ? 'cursor-not-allowed opacity-70'
                        : ''
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <circle
                              className="opacity-25"
                              cx="10"
                              cy="10"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          প্রসেসিং...
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="mr-2" />
                          অর্ডার নিশ্চিত করুন
                        </>
                      )}
                    </button>

                    {hasRegularProducts && !selectedDistrictName && (
                      <p className="mt-2 text-center text-sm text-red-500">
                        ডেলিভারি চার্জ দেখতে জেলা সিলেক্ট করুন
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
      </main >

      <Footer />
    </div >
  );
};

export default Checkout;

