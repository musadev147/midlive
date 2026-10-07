import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from 'react-use-cart';
import { config } from '../config';
import { ProductContext } from '../context/ProductsContext';
import CartPanel from '../components/CartPanel';
import ProductCard from '../components/ProductCard';
import ProductGrid from '../components/ProductGrid';
import CartTriggerButton from '../components/CartTriggerButton';

const ITEMS_PER_PAGE = 10;

const CategoryProducts = ({ columns = 5 }) => {
  const {
    products = [],
    filteredProducts = [],
    selectedCategory,
    categories = [],
  } = useContext(ProductContext);

  const { items, totalItems, addItem, updateItemQuantity, removeItem } =
    useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [displayedProducts, setDisplayedProducts] = useState([]);

  useEffect(() => {
    if (selectedCategory !== null) {
      setDisplayedProducts(filteredProducts || []);
    } else {
      setDisplayedProducts(products || []);
    }
  }, [selectedCategory, filteredProducts, products]);

  useEffect(() => {
    const updated = {};
    items.forEach((item) => {
      updated[item.product_id] = true;
    });
    setAddedItems(updated);
  }, [items]);

  const mainCategories = useMemo(() => {
    return (categories || []).filter(
      (category) =>
        category.parent_id === null ||
        category.parent_id === undefined ||
        Number(category.parent_id) === 0
    );
  }, [categories]);

  const getChildCategories = (parentId) => {
    return (categories || []).filter(
      (cat) => Number(cat.parent_id) === Number(parentId)
    );
  };

  const getAllChildCategoryIds = (parentId) => {
    const ids = [];
    const stack = [Number(parentId)];

    while (stack.length > 0) {
      const currentId = stack.pop();
      ids.push(currentId);

      const children = (categories || []).filter(
        (cat) => Number(cat.parent_id) === Number(currentId)
      );

      children.forEach((child) => {
        stack.push(Number(child.id));
      });
    }

    return ids;
  };

  const groupedProducts = useMemo(() => {
    if (selectedCategory !== null) return [];

    return mainCategories
      .map((category) => ({
        id: category.id,
        name: category.name,
        products: [],
      }));
  }, [selectedCategory, mainCategories]);

  // Per-group local state to support server-backed "Load More"
  const [groupsState, setGroupsState] = useState({});
  const groupsStateRef = useRef({});

  useEffect(() => {
    groupsStateRef.current = groupsState;
  }, [groupsState]);

  const fetchMoreForGroup = async (group) => {
    const state = groupsStateRef.current[group.id] || { products: [], visible: 0, loading: false, total: null };
    if (state.loading) return;

    // Calculate offset from current known products
    const offset = state.products.length;
    const categoryIds = getAllChildCategoryIds(group.id).join(',');

    // mark loading
    setGroupsState((prev) => ({
      ...prev,
      [group.id]: { ...state, loading: true },
    }));

    try {
      const res = await axios.get(`${config.apiUrl}/products`, {
        params: { category_ids: categoryIds, limit: ITEMS_PER_PAGE, offset },
      });

      let items = [];
      let total = null;
      if (Array.isArray(res.data)) items = res.data;
      else if (Array.isArray(res.data.data)) {
        items = res.data.data;
        total = res.data.total || res.data.total_count || null;
      } else if (Array.isArray(res.data.products)) {
        items = res.data.products;
        total = res.data.total || null;
      }

      // filter duplicates by id
      const latestState = groupsStateRef.current[group.id] || state;
      const existingIds = new Set(latestState.products.map((p) => Number(p.id)));
      const newItems = items.filter((it) => !existingIds.has(Number(it.id)));

      const updatedProducts = [...latestState.products, ...newItems];
      const updatedVisible = Math.min(updatedProducts.length, latestState.visible + ITEMS_PER_PAGE);

      setGroupsState((prev) => ({
        ...prev,
        [group.id]: {
          products: updatedProducts,
          visible: updatedVisible,
          loading: false,
          total: total !== null ? total : latestState.total,
        },
      }));
    } catch (err) {
      console.error('Failed to fetch more products for group', group.id, err);
      setGroupsState((prev) => ({ ...prev, [group.id]: { ...state, loading: false } }));
    }
  };

  const selectedCategorySubGroups = useMemo(() => {
    if (selectedCategory === null) return [];

    const subCategories = getChildCategories(selectedCategory);

    if (!subCategories.length) return [];

    return subCategories
      .map((subCategory) => ({
        id: subCategory.id,
        name: subCategory.name,
        products: [],
      }));
  }, [selectedCategory, categories]);

  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === null) return null;

    return (categories || []).find(
      (category) => Number(category.id) === Number(selectedCategory)
    );
  }, [selectedCategory, categories]);

  const activeGroups =
    selectedCategory !== null
      ? selectedCategorySubGroups.length > 0
        ? selectedCategorySubGroups
        : selectedCategoryData
          ? [selectedCategoryData]
          : []
      : groupedProducts;
  const getRenderableGroups = (groups) =>
    groups.filter((group) => {
      const state = groupsState[group.id];
      if (!state) return false;
      if (state.loading) return true;
      if ((state.total || 0) > 0) return true;
      return state.products.length > 0;
    });

  useEffect(() => {
    if (!activeGroups.length) {
      setGroupsState({});
      return;
    }

    const next = {};
    activeGroups.forEach((group) => {
      next[group.id] = {
        products: [],
        visible: 0,
        loading: false,
        total: null,
      };
    });

    setGroupsState(next);
    groupsStateRef.current = next;

    activeGroups.forEach((group) => {
      fetchMoreForGroup(group);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroups]);

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

    if (existingItem) {
      updateItemQuantity(existingItem.id, quantity);
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

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto py-6 px-3">
        {selectedCategory !== null ? (
          getRenderableGroups(activeGroups).length > 0 ? (
            <div className="space-y-8">
              {getRenderableGroups(activeGroups).map((group) => (
                <section key={group.id}>
                  <div className="mb-[12px] flex h-[51px] items-center justify-between bg-white py-3 md:mb-4">
                    <h2 className="pl-2 text-base font-semibold text-[#181717] sm:text-2xl">
                      {group.name}
                    </h2>
                  </div>

                  {/* Use local group state if available to support Load More */}
                  {groupsState[group.id] ? (
                    <>
                      <ProductGrid columns={columns}>
                        {groupsState[group.id].products
                          .slice(0, groupsState[group.id].visible)
                          .map((product) => {
                            const isOpen = showQuantitySelector[product.id]?.show;
                            const quantity = showQuantitySelector[product.id]?.quantity || 1;
                            const isAdded = addedItems[product.id];

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
                      {groupsState[group.id].products.length >= ITEMS_PER_PAGE && (groupsState[group.id].total === null || groupsState[group.id].products.length < groupsState[group.id].total) && (
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={() => fetchMoreForGroup(group)}
                            disabled={groupsState[group.id].loading}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-6 rounded-full font-semibold transition-all duration-200"
                          >
                            {groupsState[group.id].loading ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <ProductGrid columns={columns}>
                      {group.products.map((product) => {
                        const isOpen = showQuantitySelector[product.id]?.show;
                        const quantity = showQuantitySelector[product.id]?.quantity || 1;
                        const isAdded = addedItems[product.id];

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
                  )}
                </section>
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <ProductGrid columns={columns}>
              {displayedProducts.map((product) => {
                const isOpen = showQuantitySelector[product.id]?.show;
                const quantity = showQuantitySelector[product.id]?.quantity || 1;
                const isAdded = addedItems[product.id];

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
          ) : (
            <div className="text-center text-gray-500 py-10">
              কোনো প্রোডাক্ট পাওয়া যায়নি
            </div>
          )
        ) : getRenderableGroups(groupedProducts).length > 0 ? (
          <div className="space-y-8">
            {getRenderableGroups(groupedProducts).map((group) => (
              <section key={group.id}>
                <div className="mb-[12px] flex h-[51px] items-center justify-between bg-white py-3 md:mb-4">
                  <h2 className="pl-2 text-base font-semibold text-[#181717] sm:text-2xl">
                    {group.name}
                  </h2>
                </div>

                {groupsState[group.id] ? (
                  <>
                    <ProductGrid columns={columns}>
                      {groupsState[group.id].products
                        .slice(0, groupsState[group.id].visible)
                        .map((product) => {
                          const isOpen = showQuantitySelector[product.id]?.show;
                          const quantity = showQuantitySelector[product.id]?.quantity || 1;
                          const isAdded = addedItems[product.id];

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
                    {groupsState[group.id].products.length >= ITEMS_PER_PAGE && (groupsState[group.id].total === null || groupsState[group.id].products.length < groupsState[group.id].total) && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => fetchMoreForGroup(group)}
                          disabled={groupsState[group.id].loading}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-6 rounded-full font-semibold transition-all duration-200"
                        >
                          {groupsState[group.id].loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <ProductGrid columns={columns}>
                    {group.products.map((product) => {
                      const isOpen = showQuantitySelector[product.id]?.show;
                      const quantity = showQuantitySelector[product.id]?.quantity || 1;
                      const isAdded = addedItems[product.id];

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
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            কোনো প্রোডাক্ট পাওয়া যায়নি
          </div>
        )}
      </div>

      <CartTriggerButton items={items} onClick={() => setIsCartOpen(true)} />

      <CartPanel
        isOpen={isCartOpen}
        toggleCart={() => setIsCartOpen(false)}
        cartItems={items}
        removeFromCart={removeItem}
        updateQuantity={updateItemQuantity}
      />
    </div>
  );
};

export default CategoryProducts;
