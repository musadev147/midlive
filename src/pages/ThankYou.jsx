import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { initFacebookPixels, trackEventOnMultiplePixels } from '../pixel';
import { gtmPurchase } from '../utils/gtm';
import {
  FaCheckCircle,
  FaCoins,
  FaShoppingBag,
  FaUserAlt,
  FaTruck,
  FaGift,
  FaPlusCircle,
  FaMinusCircle,
  FaFlask
} from 'react-icons/fa';
import { HeaderContext } from '../context/HeaderContext';
import { ProductContext } from '../context/ProductsContext';
import * as FaIcons from 'react-icons/fa';

const ThankYou = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const { id } = useParams();
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [communities, setCommunities] = useState([]);

  const sanitizedId = id.replace(/[{}]/g, '');

  const { bonus, loading: headerLoading } = useContext(HeaderContext);
  const { pixel, apiUrl, loading: productLoading } = useContext(ProductContext);

  const productItems = useMemo(() => {
    if (!orderDetails) return [];
    return orderDetails.items || [];
  }, [orderDetails]);

  const labItems = useMemo(() => {
    if (!orderDetails) return [];
    return orderDetails.labItems || orderDetails.lab_items || [];
  }, [orderDetails]);

  const hasProductItems = productItems.length > 0;
  const hasLabItems = labItems.length > 0;

  const productItemsTotal = useMemo(() => {
    return productItems.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }, [productItems]);

  const labItemsTotal = useMemo(() => {
    return labItems.reduce((sum, item) => {
      return sum + Number(item.total_price || 0);
    }, 0);
  }, [labItems]);

  useEffect(() => {
    if (pixel.length > 0 && orderDetails) {
      initFacebookPixels(pixel);

      const contentIds = [
        ...productItems.map((item) => String(item.id || item.product_id || '')),
        ...labItems.map((item) => String(item.id || item.lab_test_id || '')),
      ].filter(Boolean);

      trackEventOnMultiplePixels(pixel, 'Lead', {
        content_ids: contentIds,
        content_type: 'product',
        value: Number(orderDetails?.total || 0),
        currency: 'BDT',
      });
    }

    if (orderDetails) {
      const allItems = [...productItems, ...labItems];
      if (allItems.length > 0) {
        gtmPurchase(orderDetails, allItems);
      } else if (orderDetails.product_name) {
        gtmPurchase(orderDetails, [{
          product_id: orderDetails.product_id || orderDetails.id,
          product_name: orderDetails.product_name,
          price: orderDetails.product_price,
          quantity: orderDetails.quantity,
          color: orderDetails.color,
          size: orderDetails.size
        }]);
      }
    }
  }, [pixel, orderDetails, productItems, labItems]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sanitizedId) {
        console.error('Invalid order ID:', sanitizedId);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/customers/${sanitizedId}`);
        const customer = response.data.customer;
        
        // Search for previous orders with same phone number
        const customersResponse = await axios.get(`${apiUrl}/customers/search/customerdata`, {
          params: { search: customer.phone_number }
        });
        
        const searchResults = customersResponse.data.customers?.data || [];
        const samePhoneOrders = searchResults.filter(
          (c) => c.phone_number === customer.phone_number
        );

        setOrderDetails(customer);

        if (samePhoneOrders.length > 1) {
          setIsUser(true);
        }

        if (!localStorage.getItem('authToken')) {
          setTimeout(() => setShowCoinAnimation(true), 1000);
        }
      } catch (error) {
        console.error('Error fetching order details:', error?.response?.data?.message || error.message);
      }
    };

    fetchOrderDetails();
  }, [apiUrl, sanitizedId]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await axios.get(`${apiUrl}/communities`);
        setCommunities(response.data || []);
      } catch (error) {
        console.error('Error fetching communities:', error?.response?.data?.message || error.message);
      }
    };

    fetchCommunity();
  }, [apiUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!phone.match(/^01[3-9]\d{8}$/)) {
      setLoginError('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট, 01 দিয়ে শুরু)');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/userlogin`, { phone });

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('phone', phone);
        setIsLoggedIn(true);
        setLoginOpen(false);
        window.location.reload();
      } else {
        setLoginError('লগইন সফল হয়নি');
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setLoginError('এই নম্বর দিয়ে কোন ইউজার নেই');
      } else {
        setLoginError('লগইনে সমস্যা হয়েছে, পরে চেষ্টা করুন');
        console.error('Login error:', err);
      }
    }
  };

  if (headerLoading || productLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg">
            <FaCheckCircle className="mx-auto mb-4 text-5xl text-green-500" />
            <h1 className="mb-4 text-2xl font-bold text-blue-900 lg:text-4xl">
              ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে।
            </h1>
            <p className="mb-6 text-lg text-gray-600">
              আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
            </p>
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <p className="font-medium text-yellow-700">
                অর্ডার ডিটেইলস পাওয়া যায়নি। অনুগ্রহ করে আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const estimatedBonus =
    bonus && Number(orderDetails.product_price || 0) > 0
      ? Math.round(Number(orderDetails.product_price || 0) * Number(bonus.bonus_percentage || 0) / 100)
      : 0;

  return (
    <>
      <Header />

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
              <h2 className="text-2xl font-bold text-white">লগইন করুন</h2>
              <p className="mt-1 text-blue-100">{bonus?.coin_name} ব্যবহার করতে লগইন করুন</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="phone">
                    মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">+88</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="mb-4 rounded border-l-4 border-red-500 bg-red-50 p-3">
                    <div className="flex items-center">
                      <svg className="mr-2 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium text-red-700">{loginError}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800"
                >
                  লগইন
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setLoginOpen(false)}
                  className="font-medium text-blue-600 transition hover:text-blue-800"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Success message */}
          <div className="mb-12 text-center">
            <div className="relative inline-block">
              <FaCheckCircle className="mx-auto mb-4 animate-bounce text-6xl text-green-500 md:text-7xl" />
              {showCoinAnimation && (
                <div className="absolute -top-4 -right-4 rounded-full bg-yellow-400 p-2 text-white animate-ping">
                  <FaCoins className="text-xl" />
                </div>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-blue-900 md:text-4xl">
              ধন্যবাদ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              আপনার অর্ডার নম্বর:{' '}
              <span className="font-bold text-blue-600">{orderDetails.order_id}</span>
            </p>
          </div>

          {/* Coin reward */}
          {!isLoggedIn && !isUser && bonus?.first_reg_bonus && (
            <div className="mx-auto mb-12 max-w-2xl rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 shadow-md">
              <div className="mb-4 flex items-center justify-center">
                <FaGift className="mr-3 text-3xl text-yellow-500" />
                <h2 className="text-2xl font-bold text-yellow-800">অভিনন্দন!</h2>
              </div>

              <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-inner">
                <FaCoins className="mr-4 text-4xl text-yellow-500" />
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    আপনি {bonus?.first_reg_bonus || 0} {bonus?.coin_name || 'কয়েন'} জিতেছেন!
                  </p>
                  <p className="mt-1 text-gray-600">
                    পরবর্তী অর্ডারে এই কয়েন ব্যবহার করতে পারবেন।
                  </p>
                  <p className="mt-1 text-gray-600">
                    ({bonus?.first_reg_bonus || 0} {bonus?.coin_name || 'কয়েন'} = ৳
                    {bonus?.first_reg_bonus || 0})
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="font-medium text-blue-800">
                  {bonus?.first_reg_bonus || 0} {bonus?.coin_name || 'কয়েন'} ব্যবহার করতে লগিন করুন।
                </p>
                <button
                  className="mt-3 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition duration-300 hover:bg-blue-700"
                  onClick={() => setLoginOpen(true)}
                >
                  লগিন করুন
                </button>
              </div>
            </div>
          )}

          {/* Order details */}
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-md">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="flex items-center text-xl font-bold text-white">
                <FaShoppingBag className="mr-2" />
                অর্ডার বিবরণ
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 flex items-center text-lg font-semibold text-gray-800">
                      <FaUserAlt className="mr-2 text-blue-500" />
                      গ্রাহক তথ্য
                    </h3>

                    <div className="pl-8">
                      <p className="mb-1 text-gray-700">
                        <span className="font-medium">নাম:</span> {orderDetails.customer_name}
                      </p>

                      <p className="mb-3 text-gray-700">
                        <span className="font-medium">ফোন:</span> {orderDetails.phone_number}
                        {bonus && estimatedBonus > 0 && (
                          <span className="ml-2 mt-1 inline-block rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800">
                            <span className="font-medium">পন্য ডেলিভারির পরে এই নাম্বারে</span>
                            <span className="ml-1">
                              {estimatedBonus} {bonus.coin_name}
                              <span className="font-bold text-green-600"> বোনাস</span> যোগ হবে
                            </span>
                          </span>
                        )}
                      </p>

                      <p className="text-gray-700">
                        <span className="font-medium">ঠিকানা:</span> {orderDetails.customer_address}
                      </p>
                    </div>
                  </div>

                  {/* Product items */}
                  {hasProductItems && (
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-4 flex items-center border-b pb-2 text-lg font-semibold text-gray-800">
                        <FaShoppingBag className="mr-2 text-blue-500" />
                        পণ্য বিবরণ
                      </h3>

                      <div className="space-y-4">
                        {productItems.map((item, index) => (
                          <div key={index} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">পণ্য:</span> {item.product_name}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">পরিমাণ:</span> {item.quantity}
                              </p>

                              {item.color && (
                                <p className="text-gray-700">
                                  <span className="font-medium text-gray-600">রং:</span>
                                  <span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                                    {item.color}
                                  </span>
                                </p>
                              )}

                              {item.size && (
                                <p className="text-gray-700">
                                  <span className="font-medium text-gray-600">সাইজ:</span>
                                  <span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                                    {item.size}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab test items */}
                  {hasLabItems && (
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-4 flex items-center border-b pb-2 text-lg font-semibold text-gray-800">
                        <FaFlask className="mr-2 text-blue-500" />
                        ল্যাব টেস্ট বিবরণ
                      </h3>

                      <div className="space-y-4">
                        {labItems.map((item, index) => (
                          <div key={index} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">টেস্ট:</span> {item.lab_test_name}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">ল্যাব:</span> {item.lab_name || 'N/A'}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">পেশেন্ট:</span> {item.patient_count}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">রিপোর্ট টাইম:</span> {item.report_time || 'N/A'}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium text-gray-600">মূল্য:</span> ৳{item.total_price}
                              </p>
                              {item.discount && (
                                <p className="text-gray-700">
                                  <span className="font-medium text-gray-600">ডিসকাউন্ট:</span> {item.discount}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasProductItems && !hasLabItems && (
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                      <h3 className="mb-4 flex items-center border-b pb-2 text-lg font-semibold text-gray-800">
                        <FaShoppingBag className="mr-2 text-blue-500" />
                        অর্ডার বিবরণ
                      </h3>

                      <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">পণ্য:</span> {orderDetails.product_name}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">পরিমাণ:</span> {orderDetails.quantity}
                          </p>
                          {orderDetails.color && (
                            <p className="text-gray-700">
                              <span className="font-medium text-gray-600">রং:</span>
                              <span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                                {orderDetails.color}
                              </span>
                            </p>
                          )}
                          {orderDetails.size && (
                            <p className="text-gray-700">
                              <span className="font-medium text-gray-600">সাইজ:</span>
                              <span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-sm">
                                {orderDetails.size}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">মূল্য বিবরণী</h3>

                  <div className="space-y-3">
                    {hasProductItems &&
                      productItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">
                            {item.product_name} (x{item.quantity})
                          </span>
                          <span className="font-medium">
                            ৳{Number(item.price || 0) * Number(item.quantity || 1)}
                          </span>
                        </div>
                      ))}

                    {hasLabItems &&
                      labItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-600">
                            {item.lab_test_name} (x{item.patient_count})
                          </span>
                          <span className="font-medium">
                            ৳{item.total_price}
                          </span>
                        </div>
                      ))}

                    {!hasProductItems && !hasLabItems && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">পণ্য মূল্য:</span>
                        <span className="font-medium">৳{orderDetails.product_price}</span>
                      </div>
                    )}

                    {orderDetails.order_bumps && orderDetails.order_bumps.length > 0 && (
                      <div className="border-t border-gray-200 pt-2">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-600">স্পেশাল অফার:</span>
                        </div>
                        {orderDetails.order_bumps.map((bump, index) => (
                          <div key={index} className="mb-1 flex items-center justify-between pl-4">
                            <div className="flex items-center">
                              <FaPlusCircle className="mr-2 text-xs text-blue-500" />
                              <span className="text-sm text-gray-600">
                                {bump.bump?.title || `অতিরিক্ত পণ্য #${index + 1}`}
                              </span>
                            </div>
                            <span className="text-sm font-medium">৳{bump.price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {orderDetails.bulk_discounts && orderDetails.bulk_discounts.length > 0 && (
                      <div className="border-t border-gray-200 pt-2">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-600">কম্বো ডিসকাউন্ট:</span>
                        </div>
                        {orderDetails.bulk_discounts.map((discount, index) => (
                          <div key={index} className="mb-1 flex items-center justify-between pl-4">
                            <div className="flex items-center">
                              <FaMinusCircle className="mr-2 text-xs text-red-500" />
                              <span className="text-sm text-gray-600">{discount.title}</span>
                            </div>
                            <span className="text-sm font-medium text-red-600">
                              - ৳{Math.floor(Number(orderDetails.product_price || 0) * Number(discount.discount_percentage || 0) / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {hasProductItems && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">প্রোডাক্ট টোটাল:</span>
                        <span className="font-medium">৳{productItemsTotal}</span>
                      </div>
                    )}

                    {hasLabItems && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ল্যাব টেস্ট টোটাল:</span>
                        <span className="font-medium">৳{labItemsTotal}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                      <span className="font-medium text-green-600">৳{orderDetails.delivery_charge}</span>
                    </div>

                    {Number(orderDetails.coins_used || 0) > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <span>{bonus?.coin_name} ডিসকাউন্ট:</span>
                        <span>- ৳{orderDetails.coins_used}</span>
                      </div>
                    )}

                    {Number(orderDetails.cod_advance || 0) > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <span>অগ্রীম পেমেন্ট:</span>
                        <span>- ৳{orderDetails.cod_advance}</span>
                      </div>
                    )}

                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>মোট পরিশোধ:</span>
                        <span className="text-blue-600">৳{orderDetails.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center">
                  <FaTruck className="mr-3 text-2xl text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">আপনার অর্ডারটি প্রস্তুত হচ্ছে!</p>
                    <p className="mt-1 text-sm text-green-600">
                      ২৪-৭২ ঘন্টার মধ্যে ডেলিভারি/কনফার্মেশন দেওয়া হবে। ডেলিভারি স্ট্যাটাস জানতে আমাদের হেল্পলাইনে কল করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Communities */}
          {communities.length > 0 &&
            communities.map((community) => {
              const IconComponent = FaIcons[community.icon] || FaIcons.FaFacebook;

              return (
                <div
                  key={community.id}
                  className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl bg-blue-50 shadow-md"
                >
                  <div className="bg-blue-700 px-6 py-4"></div>
                  <div className="p-6 text-center">
                    <div className="mb-5">
                      <IconComponent className="mx-auto h-16 w-16 text-3xl text-blue-600" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-800">{community.name}</h3>
                    <p className="mb-6 text-gray-600">{community.description}</p>
                    <a
                      href={community.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition duration-300 hover:bg-blue-700"
                    >
                      <IconComponent className="mr-2" />
                      {community.button_text}
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ThankYou;