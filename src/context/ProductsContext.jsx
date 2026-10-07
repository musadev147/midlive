import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { config } from '../config';

export const ProductContext = createContext();
let productsDataCache = null;
let productsDataInFlight = null;
let homepageDataCache = null;
let homepageDataInFlight = null;

export const ProductProvider = ({ children }) => {
  const apiUrl = config.apiUrl;
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pixel, setPixel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const filterProductsByCategory = (categoryId) => {
    setSelectedCategory(categoryId);

    if (!categoryId) {
      setFilteredProducts(products);
      return;
    }

    const getAllChildCategoryIds = (parentId) => {
      const childIds = [];
      const categoriesToCheck = [Number(parentId)];

      while (categoriesToCheck.length > 0) {
        const currentId = categoriesToCheck.pop();
        childIds.push(currentId);

        const children = categories.filter(
          (cat) => Number(cat.parent_id) === Number(currentId)
        );

        children.forEach((child) => categoriesToCheck.push(Number(child.id)));
      }

      return childIds;
    };

    const categoryIds = getAllChildCategoryIds(categoryId);

    const filtered = products.filter((product) =>
      categoryIds.includes(Number(product.category_id))
    );

    setFilteredProducts(filtered);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const isHomePage = location.pathname === '/';

      if (isHomePage) {
        if (homepageDataCache) {
          setCategories(homepageDataCache.categories);
          setPixel(homepageDataCache.pixel);
          setBanners(homepageDataCache.banners);
          setProducts([]);
          setFilteredProducts([]);
          return;
        }

        if (!homepageDataInFlight) {
          homepageDataInFlight = Promise.all([
            axios.get(`${apiUrl}/category`),
            axios.get(`${apiUrl}/pixels`),
            axios.get(`${apiUrl}/banners`),
          ]).then(([categoriesRes, pixelRes, bannersRes]) => ({
            categories: categoriesRes.data.categories || [],
            pixel: pixelRes.data.pixels?.map((p) => p.pixel_id) || '',
            banners: bannersRes.data || [],
          })).finally(() => {
            homepageDataInFlight = null;
          });
        }

        const homeData = await homepageDataInFlight;
        homepageDataCache = homeData;
        setCategories(homeData.categories);
        setPixel(homeData.pixel);
        setBanners(homeData.banners);
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      setSelectedCategory(null);

      if (productsDataCache) {
        setProducts(productsDataCache.products);
        setFilteredProducts(productsDataCache.products);
        setCategories(productsDataCache.categories);
        setPixel(productsDataCache.pixel);
        setBanners(productsDataCache.banners);
        return;
      }

      if (productsDataInFlight) {
        const cached = await productsDataInFlight;
        setProducts(cached.products);
        setFilteredProducts(cached.products);
        setCategories(cached.categories);
        setPixel(cached.pixel);
        setBanners(cached.banners);
        return;
      }

      productsDataInFlight = Promise.all([
        axios.get(`${apiUrl}/products`),
        axios.get(`${apiUrl}/category`),
        axios.get(`${apiUrl}/pixels`),
        axios.get(`${apiUrl}/banners`),
      ]).then(([productsRes, categoriesRes, pixelRes, bannersRes]) => {
        const allProducts = productsRes.data || [];
        const allCategories = categoriesRes.data.categories || [];
        const next = {
          products: allProducts,
          categories: allCategories,
          pixel: pixelRes.data.pixels?.map((p) => p.pixel_id) || '',
          banners: bannersRes.data || [],
        };
        productsDataCache = next;
        return next;
      }).finally(() => {
        productsDataInFlight = null;
      });

      const cached = await productsDataInFlight;
      setProducts(cached.products);
      setFilteredProducts(cached.products);
      setCategories(cached.categories);
      setPixel(cached.pixel);
      setBanners(cached.banners);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [apiUrl, location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' && selectedCategory !== null) {
      setSelectedCategory(null);
      setFilteredProducts([]);
    }
  }, [location.pathname, selectedCategory]);

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        selectedCategory,
        filterProductsByCategory,
        categories,
        pixel,
        banners,
        loading,
        setLoading,
        error,
        refetchData: fetchAllData,
        apiUrl,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
