import React, { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaChevronRight, FaHome, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { useCart } from 'react-use-cart';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategorySidebar from '../components/CategorySidebar';
import CartPanel from '../components/CartPanel';
import CartTriggerButton from '../components/CartTriggerButton';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import { ProductContext } from '../context/ProductsContext';
import { HeaderContext } from '../context/HeaderContext';
import { useProductScrollRestoration } from '../utils/scrollRestoration';

const INITIAL_PER_PAGE = 12;

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = (
    searchParams.get('_product') ||
    searchParams.get('_search') ||
    ''
  ).trim();
  const productType =
    searchParams.get('_product_type') || searchParams.get('_product') || 'all';

  const { apiUrl } = useContext(ProductContext);
  const { loading: headerLoading } = useContext(HeaderContext);
  const { items, addItem, updateItemQuantity, removeItem } = useCart();

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const searchScrollKey = `/search?_product_type=${encodeURIComponent(
    productType
  )}&_search=${encodeURIComponent(searchTerm)}`;

  const totalProductsFound = total || products.length;
  const searchTitle = searchTerm ? `Search Results for "${searchTerm}"` : 'Search Results';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updated = {};

    items.forEach((item) => {
      updated[item.product_id] = true;
    });

    setAddedItems(updated);
  }, [items]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [searchTerm, productType]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setProducts([]);
        setTotal(0);
        setCurrentPage(1);
        setLastPage(1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/products`, {
          params: {
            search: searchTerm,
            page: 1,
            per_page: INITIAL_PER_PAGE,
          },
        });

        const payload = response.data || {};
        const itemsList = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.products)
            ? payload.products
            : Array.isArray(payload)
              ? payload
              : [];

        setProducts(itemsList);
        setTotal(payload.total ?? itemsList.length);
        setCurrentPage(payload.current_page || 1);
        setLastPage(payload.last_page || 1);
      } catch (error) {
        console.error('Error loading search results:', error);
        setProducts([]);
        setTotal(0);
        setCurrentPage(1);
        setLastPage(1);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [apiUrl, searchTerm, productType]);

  useProductScrollRestoration(
    searchScrollKey,
    !loading && !headerLoading,
    [loading, headerLoading, searchTerm, productType],
    { offset: 160 }
  );

  const handleAddClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const existing = items.find(
      (item) => Number(item.product_id) === Number(product.id)
    );

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: {
        show: true,
        quantity: existing ? existing.quantity : 1,
      },
    }));
  };

  const handleQuantityChange = (e, productId, qty) => {
    e.preventDefault();
    e.stopPropagation();

    if (qty < 1) return;

    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: qty,
      },
    }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const existing = items.find(
      (item) => Number(item.product_id) === Number(product.id)
    );

    if (existing) {
      updateItemQuantity(existing.id, quantity);
    } else {
      addItem(
        {
          ...product,
          product_id: product.id,
          price: Number(product.discount_price || product.price),
          id: product.id.toString(),
          image:
            product?.images?.[0]?.image ||
            product.image ||
            product.product_image ||
            '/medivila-default.jpg',
          product_image:
            product?.images?.[0]?.image ||
            product.image ||
            product.product_image ||
            '/medivila-default.jpg',
          images: product.images || [],
        },
        quantity
      );
    }

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: { show: false, quantity: 1 },
    }));
  };

  const handleCancelQuantity = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: { show: false, quantity: 1 },
    }));
  };

  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= lastPage || !searchTerm) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await axios.get(`${apiUrl}/products`, {
        params: {
          search: searchTerm,
          page: nextPage,
          per_page: INITIAL_PER_PAGE,
        },
      });

      const payload = response.data || {};
      const itemsList = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.products)
          ? payload.products
          : Array.isArray(payload)
            ? payload
            : [];

      const existingIds = new Set(products.map((product) => Number(product.id)));
      const newItems = itemsList.filter(
        (product) => !existingIds.has(Number(product.id))
      );

      setProducts((prev) => [...prev, ...newItems]);
      setTotal(payload.total ?? totalProductsFound);
      setCurrentPage(payload.current_page || nextPage);
      setLastPage(payload.last_page || nextPage);
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderProductCard = (product) => {
    const isOpen = showQuantitySelector[product.id]?.show;
    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const isAdded = addedItems[product.id];

    return (
      <ProductCard
        key={product.id}
        product={product}
        scrollKey={searchScrollKey}
        isAdded={isAdded}
        isQuantitySelectorOpen={isOpen}
        quantity={quantity}
        onAddClick={handleAddClick}
        onQuantityChange={handleQuantityChange}
        onConfirmAddToCart={handleAddToCart}
        onCancelQuantity={handleCancelQuantity}
      />
    );
  };

  if (loading || headerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-500" />
          <p className="font-medium text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-14">
      <Header
        isMobile={isMobile}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col container mx-auto lg:flex-row">
        <div
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative'}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            w-80 lg:w-72 xl:w-80 flex-shrink-0 lg:mr-6 lg:block
          `}
        >
          <div className="sticky top-16 sm:top-20 lg:top-24 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden rounded-2xl bg-white lg:bg-transparent">
            <div className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg lg:shadow-sm">
              {isMobile && (
                <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4 lg:hidden">
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                      <FaLayerGroup className="text-base text-green-600 sm:text-lg" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800 sm:text-lg">
                        Categories
                      </h2>
                      <p className="text-xs text-gray-600 sm:text-sm">
                        Browse by category
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 sm:p-2"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>
              )}

              {!isMobile && (
                <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 p-4 lg:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-white p-2 shadow-xs">
                      <FaLayerGroup className="text-lg text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Categories</h2>
                      <p className="text-sm text-gray-600">Browse by category</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-full overflow-hidden">
                <CategorySidebar
                  onCategorySelect={isMobile ? () => setIsSidebarOpen(false) : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:mt-0">
          <div className="border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="container mx-auto px-3 py-3 md:px-6">
              <nav className="flex items-center gap-2 overflow-x-auto text-sm text-gray-600">
                <Link
                  to="/"
                  className="flex items-center whitespace-nowrap text-green-600 transition-colors hover:text-green-700"
                >
                  <FaHome className="mr-2" />
                  Home
                </Link>

                <FaChevronRight className="shrink-0 text-xs text-gray-400" />
                <span className="whitespace-nowrap font-semibold text-gray-900">
                  Search
                </span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-3 py-4 md:px-6 md:py-6">
            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                    {searchTitle}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Showing products matched by your search query.
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {totalProductsFound} products
                </span>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 md:px-6 md:py-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {productType}
                    </span>
                    {searchTerm && (
                      <span className="text-sm text-gray-500">
                        Search term:{' '}
                        <span className="font-medium text-gray-800">{searchTerm}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-3 py-3 md:px-6 md:py-5">
                  {products.length > 0 ? (
                    <>
                      <ProductGrid columns={5} className="gap-2 md:gap-3">
                        {products.map(renderProductCard)}
                      </ProductGrid>

                      {currentPage < lastPage && (
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loadingMore
                              ? 'Loading...'
                              : `Load More (${products.length} of ${totalProductsFound})`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8">
                        <h3 className="text-base font-semibold text-gray-900">
                          No products found
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          Try another keyword or browse categories from the sidebar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <CartTriggerButton items={items} onClick={() => setIsCartOpen(true)} />

      <CartPanel
        isOpen={isCartOpen}
        toggleCart={() => setIsCartOpen(false)}
        cartItems={items}
        removeFromCart={removeItem}
        updateQuantity={updateItemQuantity}
      />

      <Footer />
    </div>
  );
};

export default SearchResult;
