import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  FaUser,
  FaHeadset,
  FaPhoneAlt,
  FaEnvelope,
  FaBars,
  FaSearch,
  FaTimes,
  FaCoins,
  FaGift,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import { HeaderContext } from '../context/HeaderContext';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { config } from '../config';
import AppLogo from './AppLogo';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ isMobile, toggleSidebar, isSidebarOpen }) => {
  const {
    bonus,
    coinPackages,
    contactInfo,
    headerMenus,
    error,
  } = useContext(HeaderContext);

  const apiUrl = config.apiUrl;
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    wallet_number: '',
    phone: '',
    coin_package_id: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [viewportIsMobile, setViewportIsMobile] = useState(false);

  const placeholderTexts = [
    'আপনি কি খুঁজতে চান?',
    'পণ্যের নাম লিখুন...',
    'ব্র্যান্ড বা ক্যাটাগরি সার্চ করুন',
    'সেরা অফার খুঁজুন...',
    'পণ্য কোড বা নাম লিখুন',
  ];

  const searchColorSchemes = [
    {
      border: 'border-green-400',
      ring: 'focus:ring-green-500',
      bg: 'bg-green-50',
      button: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      border: 'border-blue-400',
      ring: 'focus:ring-blue-500',
      bg: 'bg-blue-50',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    },
    {
      border: 'border-purple-400',
      ring: 'focus:ring-purple-500',
      bg: 'bg-purple-50',
      button: 'bg-gradient-to-r from-purple-500 to-violet-600',
    },
    {
      border: 'border-orange-400',
      ring: 'focus:ring-orange-500',
      bg: 'bg-orange-50',
      button: 'bg-gradient-to-r from-orange-500 to-amber-600',
    },
    {
      border: 'border-pink-400',
      ring: 'focus:ring-pink-500',
      bg: 'bg-pink-50',
      button: 'bg-gradient-to-r from-pink-500 to-rose-600',
    },
  ];

  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const currentColor = searchColorSchemes[currentColorIndex];

  const debouncedSearchNavigate = useMemo(
    () =>
      debounce((value) => {
        navigate(`/search?_product=${encodeURIComponent(value)}`, {
          replace: true,
        });
        setIsSearching(false);
      }, 400),
    [navigate]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
      setCurrentColorIndex((prev) => (prev + 1) % searchColorSchemes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setViewportIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (searchInput) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [searchInput]);

  useEffect(() => {
    return () => {
      debouncedSearchNavigate.cancel();
    };
  }, [debouncedSearchNavigate]);

  const clearSearch = () => {
    setSearchInput('');
    setIsSearching(false);
    debouncedSearchNavigate.cancel();
    navigate('/search', { replace: true });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (!value.trim()) {
      debouncedSearchNavigate.cancel();
      setIsSearching(false);
      navigate('/search', { replace: true });
      return;
    }

    setIsSearching(true);
    debouncedSearchNavigate(value.trim());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    debouncedSearchNavigate.cancel();

    if (!searchInput.trim()) {
      navigate('/search', { replace: false });
      return;
    }

    const query = searchInput.trim();
    navigate(`/search?_product=${encodeURIComponent(query)}`);
  };

  const isMobileView = typeof isMobile === 'boolean' ? isMobile : viewportIsMobile;

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        } catch (err) {
          localStorage.removeItem('authToken');
        }
      }
    };

    checkLoggedInUser();
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
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await axios.post(
          `${apiUrl}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('phone');
      setUser(null);
      setPhone('');
      setLoginOpen(false);
      window.location.reload();
    }
  };

  const openPaymentModal = (pkg) => {
    setSelectedPackage(pkg);
    setPaymentForm({
      name: user?.name || '',
      wallet_number: '',
      phone: user?.phone || '',
      coin_package_id: pkg.id,
    });
    setPaymentModalOpen(true);
    setPaymentSuccess(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await axios.post(`${apiUrl}/cointransactions`, {
        coin_package_id: selectedPackage.id,
        name: user.name,
        ...paymentForm,
      });

      setPaymentSuccess(true);

      if (user) {
        const token = localStorage.getItem('authToken');
        const userResponse = await axios.get(`${apiUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userResponse.data);
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-800 text-sm font-medium py-1">
          <marquee behavior="scroll" direction="left" scrollamount="10">
            <h3 className="text-lg font-bold">সাইট ডেভেলপমেন্ট পর্যায়ে রয়েছে, কিছু সমস্যা হতে পারে। ধৈর্য ধরার জন্য ধন্যবাদ!</h3>
          </marquee>
        </div> */}
        <div className="py-3 px-4 border-b border-gray-200">
          <div className="container mx-auto">
            {/* Mobile Top Row */}
            <div className="flex md:hidden justify-between items-center mb-3">
              {isMobileView && (
                <div className="z-50">
                  <button
                    onClick={toggleSidebar}
                    className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    {isSidebarOpen ? (
                      <FaTimes className="text-gray-700 text-lg" />
                    ) : (
                      <FaBars className="text-gray-700 text-lg" />
                    )}
                  </button>
                </div>
              )}

              <a href="/" className="mx-auto">
                <AppLogo className="h-10" />
              </a>

              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setLoginOpen(true)}
                >
                  <FaUser />
                </button>
              </div>
            </div>

            {/* Mobile Search - Always Open */}
            <div className="md:hidden">
              <form onSubmit={handleSearchSubmit} className="flex animate-slide-down">
                <div
                  className={`flex-grow relative rounded-l-xl overflow-hidden border-2 ${currentColor.border} ${currentColor.bg} shadow-lg`}
                >
                  <input
                    type="text"
                    placeholder={placeholderTexts[placeholderIndex]}
                    value={searchInput}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-500 text-gray-800 pl-12 pr-12"
                  />

                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaSearch
                      className={`text-lg ${currentColor.ring.replace(
                        'focus:ring-',
                        'text-'
                      )}`}
                    />
                  </div>

                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className={`px-5 py-3 text-white rounded-r-xl transition-all duration-300 shadow-lg ${
                    isSearching
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${currentColor.button} hover:shadow-xl`
                  }`}
                >
                  {isSearching ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </form>
            </div>

            {/* Desktop Top Row */}
            <div className="hidden md:flex items-center justify-between">
              <a href="/" className="mr-6">
                <AppLogo className="h-12" />
              </a>

              <div className="flex-grow max-w-2xl mx-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div
                    className={`relative overflow-hidden rounded-xl transition-all duration-500 ${currentColor.bg} border-2 ${currentColor.border} hover:shadow-lg transform hover:scale-[1.02] group`}
                  >
                    <input
                      type="text"
                      placeholder={placeholderTexts[placeholderIndex]}
                      value={searchInput}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-3 bg-transparent focus:outline-none focus:ring-2 ${currentColor.ring} focus:border-transparent transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium pl-12`}
                    />

                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaSearch
                        className={`text-xl transition-colors duration-500 ${currentColor.ring.replace(
                          'focus:ring-',
                          'text-'
                        )} group-hover:scale-110 transform`}
                      />
                    </div>

                    {isTyping && (
                      <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                        <div className="flex space-x-1">
                          <div
                            className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="absolute right-0 top-0 h-full flex items-center space-x-1 pr-1">
                      {searchInput && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110 transform hover:bg-white/50 rounded-lg"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSearching}
                        className={`p-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                          isSearching
                            ? 'bg-gray-400 cursor-not-allowed'
                            : `${currentColor.button} hover:shadow-xl`
                        }`}
                      >
                        {isSearching ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaSearch />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                    <FaCoins className="text-yellow-600 mr-2 text-lg" />
                    <span className="font-bold text-yellow-800">
                      {user.points} {bonus?.coin_name}
                    </span>
                  </div>
                )}

                <button
                  className="flex items-center text-gray-700 hover:text-green-600 transition-all duration-300 group"
                  onClick={() => setLoginOpen(true)}
                >
                  <div className="relative p-3 group-hover:bg-green-50 rounded-full transition-all duration-300 group-hover:scale-110">
                    <FaUser className="text-lg" />
                  </div>
                  <span className="ml-2 hidden lg:inline-block font-medium">
                    {user ? user.name : 'Account'}
                  </span>
                </button>

                <a
                  href="/contact"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                >
                  <div className="p-3 group-hover:bg-blue-50 rounded-full transition-all duration-300 group-hover:scale-110">
                    <FaHeadset className="text-lg" />
                  </div>
                  <span className="ml-2 hidden lg:inline-block font-medium">
                    Support
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-green-600 hidden md:block">
          <div className="container mx-auto">
            <nav className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-8">
                {headerMenus?.map((menu, index) => (
                  menu.link?.startsWith('/') ? (
                    <Link
                      key={menu.id}
                      to={menu.link}
                      className="text-white hover:text-green-200 transition-colors duration-300 font-medium text-sm uppercase tracking-wide"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {menu.name}
                    </Link>
                  ) : (
                    <a
                      key={menu.id}
                      href={menu.link || menu.url}
                      className="text-white hover:text-green-200 transition-colors duration-300 font-medium text-sm uppercase tracking-wide"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {menu.name}
                    </a>
                  )
                ))}
              </div>

              <div className="flex items-center space-x-6 text-white text-sm">
                {contactInfo?.phone && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center hover:text-green-200 transition-colors"
                  >
                    <FaPhoneAlt className="mr-2 text-xs" />
                    {contactInfo.phone}
                  </a>
                )}
                {contactInfo?.email && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center hover:text-green-200 transition-colors"
                  >
                    <FaEnvelope className="mr-2 text-xs" />
                    {contactInfo.email}
                  </a>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Login Modal */}
        {loginOpen && bonus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  {user ? 'My Account' : 'Login'}
                </h3>
                <button
                  onClick={() => {
                    setLoginOpen(false);
                    setLoginError('');
                    setPhone('');
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                {!user ? (
                  <>
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-start">
                        <FaGift className="text-blue-600 mt-1 mr-3 flex-shrink-0 text-lg" />
                        <div>
                          <h4 className="font-bold text-blue-800 mb-1">
                            বিশেষ অফার!
                          </h4>
                          <p className="text-sm text-blue-700">
                            প্রথম কেনায় পাচ্ছেন {bonus.first_reg_bonus}{' '}
                            {bonus.coin_name} এবং{' '}
                            {Math.round(bonus.bonus_percentage)}% {bonus.coin_name}{' '}
                            অতিরিক্ত বোনাস!
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleLogin}>
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-3 font-semibold">
                          মোবাইল নম্বর
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                        {loginError && (
                          <p className="text-red-500 text-sm mt-2 flex items-center animate-fade-in">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {loginError}
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        লগইন
                      </button>
                    </form>
                  </>
                ) : (
                  <div>
                    <div className="flex items-start mb-6">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <FaUser className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">
                          {user.name}
                        </h4>
                        <p className="text-gray-600">{user.phone}</p>
                        <div className="flex items-center mt-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1 rounded-full w-max border border-yellow-200">
                          <FaCoins className="text-yellow-600 mr-2" />
                          <span className="font-bold text-yellow-800">
                            {user.points} {bonus.coin_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {coinPackages && coinPackages.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          কয়েন প্যাকেজ কিনুন
                        </h3>
                        <div className="grid gap-3">
                          {coinPackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg overflow-hidden group"
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center">
                                    <div className="bg-yellow-100 p-2 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                                      <FaCoins className="text-yellow-500" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">
                                      {pkg.name}
                                    </h4>
                                  </div>
                                  <span className="text-lg font-bold text-gray-900">
                                    {pkg.coins} {bonus.coin_name}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    {pkg.bonus && (
                                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                        +{pkg.bonus}% বোনাস
                                      </span>
                                    )}
                                    {pkg.popular && (
                                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                        জনপ্রিয়
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => openPaymentModal(pkg)}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                  >
                                    কিনুন {pkg.price && `${pkg.price}৳`}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold border border-gray-200 hover:border-gray-300"
                    >
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  পেমেন্ট সম্পন্ন করুন
                </h3>
                <button
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setPaymentSuccess(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                {paymentSuccess ? (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                      <FaCheckCircle className="text-green-500 text-5xl animate-scale-in" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      পেমেন্ট সফল হয়েছে!
                    </h4>
                    <p className="text-gray-600 mb-4">
                      আপনার অ্যাকাউন্টে {selectedPackage.coins} {bonus.coin_name}{' '}
                      যোগ করা হয়েছে।
                    </p>
                    <button
                      onClick={() => setPaymentModalOpen(false)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      ঠিক আছে
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 mb-6">
                      <h4 className="font-bold text-blue-800 mb-3">
                        বিকাশ/নগদে পেমেন্ট করুন
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          1. বিকাশ/নগদ অ্যাপে যান এবং "Send Money" নির্বাচন করুন
                        </p>
                        <p className="text-gray-700">
                          2. নিচের নাম্বারে {selectedPackage?.price}৳ পাঠান:
                        </p>
                        <p className="text-lg font-bold text-center bg-white p-3 rounded-lg border-2 border-dashed border-blue-300 my-2">
                          {contactInfo?.tnx_number || '01XXXXXXXXX'}
                        </p>
                        <p className="text-gray-700">
                          3. নিচের ফর্মে ট্রানজেকশন করা নম্বর দিন এবং আপনার
                          মোবাইল নম্বর দিন
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-semibold">
                          বিকাশ/নগদ নাম্বার দিন
                        </label>
                        <input
                          type="text"
                          name="wallet_number"
                          value={paymentForm.wallet_number}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              wallet_number: e.target.value,
                            })
                          }
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-semibold">
                          আপনার মোবাইল নম্বর
                        </label>
                        <input
                          type="tel"
                          value={paymentForm.phone}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="01XXXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition-all duration-300"
                          required
                          readOnly
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-semibold">
                          পরিমাণ
                        </label>
                        <input
                          type="text"
                          value={`${selectedPackage?.price}৳`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 font-bold text-gray-800"
                          readOnly
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        পেমেন্ট নিশ্চিত করুন
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;

