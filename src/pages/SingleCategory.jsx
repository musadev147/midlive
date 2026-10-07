import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaChevronRight, FaHome, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { useCart } from 'react-use-cart';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategorySidebar from '../components/CategorySidebar';
import { ProductContext } from '../context/ProductsContext';
import { HeaderContext } from '../context/HeaderContext';
import { useProductScrollRestoration } from '../utils/scrollRestoration';
import CartPanel from '../components/CartPanel';
import CartTriggerButton from '../components/CartTriggerButton';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import CategoryShowcase from '../components/CategoryShowcase';

const INITIAL_VISIBLE_PRODUCTS = 10;
const LOAD_MORE_STEP = 10;

const buildCategoryMaps = (categories = []) => {
  const byId = new Map();
  const childrenByParent = new Map();

  categories.forEach((category) => {
    const categoryId = Number(category.id);
    const parentId = Number(category.parent_id || 0);

    byId.set(categoryId, category);

    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }

    childrenByParent.get(parentId).push(category);
  });

  const sortCategories = (list = []) =>
    [...list].sort((a, b) => {
      const orderA = Number(a.sort_order ?? 0);
      const orderB = Number(b.sort_order ?? 0);

      if (orderA !== orderB) return orderA - orderB;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  childrenByParent.forEach((list, parentId) => {
    childrenByParent.set(parentId, sortCategories(list));
  });

  return { byId, childrenByParent };
};

const SingleCategory = () => {
  const { id } = useParams();
  const { products = [], categories = [], loading: productLoading } =
    useContext(ProductContext);
  const { loading: headerLoading } = useContext(HeaderContext);
  const { items, addItem, updateItemQuantity, removeItem } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const categoryScrollKey = `/category/${id}`;
  const { byId: categoryById, childrenByParent } = useMemo(
    () => buildCategoryMaps(categories),
    [categories]
  );

  const currentCategory = useMemo(() => {
    if (!id) return null;

    const slugMatch = categories.find(
      (category) => String(category.slug || '') === String(id)
    );
    if (slugMatch) return slugMatch;

    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      return (
        categories.find((category) => Number(category.id) === numericId) || null
      );
    }

    return null;
  }, [categories, id]);

  const currentCategoryId = currentCategory ? Number(currentCategory.id) : null;

  const productMap = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const categoryId = Number(product.category_id);

      if (!map.has(categoryId)) {
        map.set(categoryId, []);
      }

      map.get(categoryId).push(product);
    });

    map.forEach((productList, categoryId) => {
      map.set(
        categoryId,
        [...productList].sort((a, b) => Number(b.id) - Number(a.id))
      );
    });

    return map;
  }, [products]);

  const subtreeCountMap = useMemo(() => {
    const cache = new Map();

    const getSubtreeCount = (categoryId) => {
      const numericId = Number(categoryId);
      if (cache.has(numericId)) return cache.get(numericId);

      const directCount = (productMap.get(numericId) || []).length;
      const children = childrenByParent.get(numericId) || [];

      const total = children.reduce(
        (sum, child) => sum + getSubtreeCount(child.id),
        directCount
      );

      cache.set(numericId, total);
      return total;
    };

    categories.forEach((category) => {
      getSubtreeCount(category.id);
    });

    return cache;
  }, [categories, childrenByParent, productMap]);

  const categoryTrail = useMemo(() => {
    if (!currentCategory) return [];

    const trail = [];
    let cursor = currentCategory;

    while (cursor) {
      trail.unshift(cursor);

      if (!cursor.parent_id) break;

      cursor = categoryById.get(Number(cursor.parent_id)) || null;
    }

    return trail;
  }, [categoryById, currentCategory]);

  const currentCategoryChildren = useMemo(() => {
    if (!currentCategoryId) return [];

    return childrenByParent.get(currentCategoryId) || [];
  }, [childrenByParent, currentCategoryId]);

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
    setVisibleCounts({});
    setShowQuantitySelector({});
    setIsCartOpen(false);
  }, [currentCategoryId]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentCategoryId]);

  useProductScrollRestoration(
    categoryScrollKey,
    !productLoading && Boolean(currentCategory),
    [productLoading, currentCategoryId, id],
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

  const handleLoadMore = (categoryId) => {
    const numericId = Number(categoryId);
    const total = (productMap.get(numericId) || []).length;

    setVisibleCounts((prev) => {
      const current = prev[numericId] ?? Math.min(INITIAL_VISIBLE_PRODUCTS, total);
      return {
        ...prev,
        [numericId]: Math.min(current + LOAD_MORE_STEP, total),
      };
    });
  };

  const getVisibleCount = (categoryId, total) => {
    const numericId = Number(categoryId);
    return visibleCounts[numericId] ?? Math.min(INITIAL_VISIBLE_PRODUCTS, total);
  };

  const renderProductCard = (product) => {
    const isOpen = showQuantitySelector[product.id]?.show;
    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const isAdded = addedItems[product.id];

    return (
      <ProductCard
        key={product.id}
        product={product}
        scrollKey={categoryScrollKey}
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

  const renderCategorySection = (category, level = 0) => {
    const categoryId = Number(category.id);
    const directProducts = productMap.get(categoryId) || [];
    const children = childrenByParent.get(categoryId) || [];
    const childSections = children;
    const subtreeCount = subtreeCountMap.get(categoryId) || 0;

    const visibleCount = getVisibleCount(categoryId, directProducts.length);
    const visibleProducts = directProducts.slice(0, visibleCount);
    const showLoadMore = directProducts.length > visibleCount;

    return (
      <section
        key={categoryId}
        className={`space-y-4 ${level > 0 ? 'pl-3 md:pl-5 border-l border-gray-100' : ''}`}
      >
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 md:px-6 md:py-4">
            <div>
              <h2
                className={`font-bold text-gray-900 ${
                  level === 0 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                }`}
              >
                {category.name}
              </h2>
              <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-600" />
            </div>

            <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {subtreeCount} products
            </span>
          </div>

          {directProducts.length > 0 ? (
            <div className="px-3 py-3 md:px-6 md:py-5">
              <ProductGrid columns={5} className="gap-2 md:gap-3">
                {visibleProducts.map(renderProductCard)}
              </ProductGrid>

              {showLoadMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleLoadMore(categoryId)}
                    className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-emerald-700"
                  >
                    Load More ({visibleProducts.length} of {directProducts.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            !childSections.length && (
              <div className="px-3 py-8 text-center md:px-6">
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8">
                  <h3 className="text-base font-semibold text-gray-900">
                    No products found
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    This category does not have any products yet.
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {childSections.length > 0 && (
          <div className="space-y-6">
            {childSections.map((childCategory) =>
              renderCategorySection(childCategory, level + 1)
            )}
          </div>
        )}
      </section>
    );
  };

  if (productLoading || headerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-500" />
          <p className="font-medium text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="mt-2 text-gray-600">
            The category you opened does not exist or has been removed.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Back to home
          </Link>
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

            {categoryTrail.map((trailCategory, index) => (
              <React.Fragment key={trailCategory.id}>
                <FaChevronRight className="shrink-0 text-xs text-gray-400" />
                {index === categoryTrail.length - 1 ? (
                  <span className="whitespace-nowrap font-semibold text-gray-900">
                    {trailCategory.name}
                  </span>
                ) : (
                  <Link
                    to={`/category/${trailCategory.slug || trailCategory.id}`}
                    className="whitespace-nowrap transition-colors hover:text-green-700 hover:underline"
                    aria-label={`Browse ${trailCategory.name} category`}
                  >
                    {trailCategory.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-3 py-4 md:px-6 md:py-6">
        <section className="space-y-4">
          {currentCategoryChildren.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white px-3 py-4 shadow-sm md:px-6 md:py-5">
              <CategoryShowcase
                categories={currentCategoryChildren}
                title="Shop by Category"
                layout="grid"
                containerClassName="px-0 py-0"
                headingClassName="text-left"
                gridClassName="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8"
              />
            </div>
          )}

          <div className="space-y-8">
            {currentCategoryChildren.length > 0
              ? currentCategoryChildren.map((childCategory) =>
                  renderCategorySection(childCategory, 0)
                )
              : renderCategorySection(currentCategory, 0)}
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

export default SingleCategory;
