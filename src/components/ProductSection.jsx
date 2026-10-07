import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from 'react-use-cart';
import { ProductContext } from '../context/ProductsContext';
import ProductCard from './ProductCard';
import ProductGrid from './ProductGrid';

const ITEMS_PER_PAGE = 10;

const ProductSection = ({
  category,
  title = null,
  className = '',
  columns = 5,
}) => {
  const { apiUrl } = useContext(ProductContext);
  const { items, addItem, updateItemQuantity } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const categoryKey = useMemo(() => {
    return category?.slug || category?.id || null;
  }, [category]);

  const fetchProducts = async (page = 1, append = false) => {
    if (!categoryKey) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${apiUrl}/category/${categoryKey}`, {
        params: { page, per_page: ITEMS_PER_PAGE },
      });

      const payload = response.data?.products || {};
      const incomingProducts = Array.isArray(payload.data) ? payload.data : [];

      setProducts((prev) => {
        if (!append) return incomingProducts;

        const existingIds = new Set(prev.map((item) => Number(item.id)));
        const nextItems = incomingProducts.filter(
          (item) => !existingIds.has(Number(item.id))
        );

        return [...prev, ...nextItems];
      });
      setCurrentPage(payload.current_page || page);
      setLastPage(payload.last_page || page);
      setTotal(payload.total ?? incomingProducts.length);
    } catch (error) {
      console.error('Failed to load homepage category section:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setLastPage(1);
    setTotal(0);
    setShowQuantitySelector({});
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey, apiUrl]);

  useEffect(() => {
    const updated = {};
    items.forEach((item) => {
      updated[item.product_id] = true;
    });
    setAddedItems(updated);
  }, [items]);

  const handleAddClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const existingItem = items.find(
      (item) => Number(item.product_id) === Number(product.id)
    );

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: {
        show: true,
        quantity: existingItem ? existingItem.quantity : 1,
      },
    }));
  };

  const handleQuantityChange = (e, productId, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();

    if (newQuantity < 1) return;

    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity,
      },
    }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const existingItem = items.find(
      (item) => Number(item.product_id) === Number(product.id)
    );

    const cartItem = {
      id: product.id.toString(),
      product_id: product.id,
      name: product.name,
      price: Number(product.discount_price || product.price || 0),
      image: product.images?.[0]?.image || product.image || product.product_image || '/medivila-default.jpg',
      product_image: product.images?.[0]?.image || product.image || product.product_image || '/medivila-default.jpg',
      images: product.images || [],
      quantity,
    };

    if (existingItem) {
      updateItemQuantity(existingItem.id, quantity);
    } else {
      addItem(cartItem, quantity);
    }

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: { ...prev[product.id], show: false, quantity: 1 },
    }));

    navigate('/checkout');
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
    if (loadingMore || currentPage >= lastPage) return;
    await fetchProducts(currentPage + 1, true);
  };

  if (!categoryKey) {
    return null;
  }

  const hasMore = currentPage < lastPage;

  return (
    <section className={`py-4 md:py-6 ${className}`}>
      <div className="container mx-auto px-3 md:px-6">
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {title || category?.name}
            </h2>
            <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-600" />
          </div>

          {typeof total === 'number' && total > 0 && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              {total} products
            </span>
          )}
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <ProductGrid columns={columns}>
              {products.map((product) => {
                const isAdded = addedItems[product.id];
                const isOpen = showQuantitySelector[product.id]?.show;
                const quantity = showQuantitySelector[product.id]?.quantity || 1;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    scrollKey="/"
                    isAdded={isAdded}
                    isQuantitySelectorOpen={isOpen}
                    quantity={quantity}
                    onAddClick={handleAddClick}
                    onQuantityChange={handleQuantityChange}
                    onConfirmAddToCart={handleAddToCart}
                    onCancelQuantity={handleCancelQuantity}
                  />
                );
              })}
            </ProductGrid>

            {hasMore && (
              <div className="mt-6 flex justify-center md:mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full bg-gradient-to-r from-green-400 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-green-500 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore
                    ? 'Loading...'
                    : `Load More (${products.length}${total ? ` of ${total}` : ''})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            No products found for this category.
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
