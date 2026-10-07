import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';

export const HeaderContext = createContext();
let headerDataCache = null;
let headerDataInFlight = null;
let productsSearchCache = null;

export const HeaderProvider = ({ children }) => {
  const apiUrl = config.apiUrl;
  
  // সমস্ত স্টেট
  const [categories, setCategories] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [logo, setLogo] = useState('');
  const [headerMenus, setHeaderMenus] = useState([]);
  const [footerMenus, setFooterMenus] = useState([]);
  const [legalPages, setLegalPages] = useState([]);
  const [socialLinks, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchProducts, setSearchProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [bonus, setBonus] = useState({});
  const [coinPackages, setCoinPackages] = useState([]);

  const normalizeHeaderMenus = useCallback((menus = []) => {
    const homeMenu = {
      id: 'static-home',
      name: 'Home',
      url: '/',
      link: '/',
      menu_type: 'header',
      order: -1,
    };

    const filteredMenus = menus.filter((menu) => {
      const name = String(menu?.name || '').trim().toLowerCase();
      return name !== 'home';
    });

    return [homeMenu, ...filteredMenus].sort((a, b) => a.order - b.order);
  }, []);

  // Retry helper function
const retryRequest = async (fn, retries = 3, delay = 2000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.response?.status === 429) {
        console.warn(`⏳ Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return retryRequest(fn, retries - 1, delay * 2); // exponential backoff
      } else {
        throw error;
      }
    }
  };


  // সমস্ত ডেটা ফেচ করার ফাংশন
  const fetchHeaderData = useCallback(async () => {
    setLoading(true);
    try {
      if (headerDataCache) {
        setCategories(headerDataCache.categories);
        setContactInfo(headerDataCache.contactInfo);
        setHeaderMenus(headerDataCache.headerMenus);
        setFooterMenus(headerDataCache.footerMenus);
        setLegalPages(headerDataCache.legalPages || []);
        setLogo(headerDataCache.logo);
        setSocials(headerDataCache.socialLinks);
        setBonus(headerDataCache.bonus);
        setCoinPackages(headerDataCache.coinPackages);
        return;
      }

      if (!headerDataInFlight) {
        headerDataInFlight = Promise.all([
        retryRequest(() => axios.get(`${apiUrl}/category`)),
        retryRequest(() => axios.get(`${apiUrl}/contactinfos`)),
        retryRequest(() => axios.get(`${apiUrl}/sociallinks`)),
        retryRequest(() => axios.get(`${apiUrl}/menus`)),
        retryRequest(() => axios.get(`${apiUrl}/legalpages`)),
        retryRequest(() => axios.get(`${apiUrl}/websitelogos`)),
        retryRequest(() => axios.get(`${apiUrl}/bonuscoins`)),
        retryRequest(() => axios.get(`${apiUrl}/coinpackages`)),
      ]).finally(() => {
        headerDataInFlight = null;
      });
      }

      const [categoriesRes, contactRes, socialRes, menusRes, legalPagesRes, logosRes, bonusCoin, coinPackage] = await headerDataInFlight;

      // ক্যাটাগরি সেট
      setCategories(
        categoriesRes.data.categories.sort((a, b) => (a.sort_order ?? a.order ?? 0) - (b.sort_order ?? b.order ?? 0))
      );
      
      // কন্টাক্ট ইনফো সেট
      setContactInfo(contactRes.data[0] || {});
      
      // মেনু সেট
      const allMenus = menusRes.data;
      const allLegalPages = Array.isArray(legalPagesRes.data) ? legalPagesRes.data : [];
      const headerMenusData = normalizeHeaderMenus(
        allMenus.filter(menu => menu.menu_type === 'header')
      );
      setHeaderMenus(headerMenusData);
      setFooterMenus(allMenus.filter(menu => menu.menu_type === 'footer').sort((a, b) => a.order - b.order));
      setLegalPages(allLegalPages);
      
      // লোগো সেট
      setLogo(logosRes.data[0]);

        // সোশ্যাল লিঙ্কস সেট
      const filteredSocials = socialRes.data.filter(social => social.status === 1);
      setSocials(filteredSocials);

      setBonus (bonusCoin.data[0])
      setCoinPackages(coinPackage.data)
      headerDataCache = {
        categories: categoriesRes.data.categories.sort((a, b) => (a.sort_order ?? a.order ?? 0) - (b.sort_order ?? b.order ?? 0)),
        contactInfo: contactRes.data[0] || {},
        headerMenus: headerMenusData,
        footerMenus: allMenus.filter(menu => menu.menu_type === 'footer').sort((a, b) => a.order - b.order),
        legalPages: allLegalPages,
        logo: logosRes.data[0],
        socialLinks: filteredSocials,
        bonus: bonusCoin.data[0],
        coinPackages: coinPackage.data,
      };

    } catch (err) {
      setError(err.message || "An error occurred");
      console.error("Header data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, normalizeHeaderMenus]);

  // সার্চ ফাংশন
  const handleSearch = async (searchText) => {
    try {
      if (!productsSearchCache) {
        const response = await axios.get(`${apiUrl}/products`);
        productsSearchCache = response.data || [];
      }
      const filteredProducts = productsSearchCache.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setSearchProducts(filteredProducts);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchProducts([]);
      setShowResults(true);
    }
  };

  // প্রাথমিক ডেটা লোড
  useEffect(() => {
    fetchHeaderData();
  }, [fetchHeaderData]);

  return (
    <HeaderContext.Provider
      value={{
        bonus,
        coinPackages,
        categories,
        contactInfo,
        logo,
        socialLinks,
        headerMenus,
        footerMenus,
        legalPages,
        loading,
        error,
        searchProducts,
        setSearchProducts,
        showResults,
        handleSearch,
        setShowResults,
        refetchData: fetchHeaderData
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

