import React, { useState, useEffect, useContext } from 'react';
import { config } from '../config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ProductContext } from '../context/ProductsContext';
import { HeaderContext } from '../context/HeaderContext';
import { useCart } from 'react-use-cart';
import CartPanel from '../components/CartPanel';
import {
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { initFacebookPixels, trackEventOnMultiplePixels } from '../pixel';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import { saveProductAnchor, useProductScrollRestoration } from '../utils/scrollRestoration';
import CartTriggerButton from '../components/CartTriggerButton';

const Shop = () => {
  const imageUrl = config.imageUrl;
  const { pixel, products, loading: productLoading } = useContext(ProductContext);
  const { loading: headerLoading } = useContext(HeaderContext);

  const { items, totalItems, addItem, updateItemQuantity, removeItem } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [addedItems, setAddedItems] = useState({});

  useProductScrollRestoration('/shop', !headerLoading && !productLoading, [
    headerLoading,
    productLoading,
  ], { offset: 160 });

  useEffect(() => {
    if (pixel.length > 0) {
      initFacebookPixels(pixel);

      trackEventOnMultiplePixels(pixel, 'ViewShop', {
        content_name: 'All Products',
        content_type: 'product_group',
        num_items: products.length,
      });
    }
  }, [pixel, products.length]);

  useEffect(() => {
    const updated = {};
    items.forEach((item) => {
      updated[item.id] = true;
    });
    setAddedItems(updated);
  }, [items]);

  const toggleDropdown = (productId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleColorSelect = (productId, colorId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        colorId,
        sizeId: null,
      },
    }));
  };

  const handleSizeSelect = (productId, sizeId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        sizeId,
      },
    }));
  };

  const validateProductSelection = (product) => {
    if (product.colors?.length > 0 && !selectedOptions[product.id]?.colorId) {
      alert('Please select a color');
      return false;
    }

    if (
      product.clothing &&
      product.colors?.find((c) => c.id === selectedOptions[product.id]?.colorId)?.sizes
        ?.length > 0 &&
      !selectedOptions[product.id]?.sizeId
    ) {
      alert('Please select a size');
      return false;
    }

    if (
      product.single_product_sizes?.length > 0 &&
      !selectedOptions[product.id]?.sizeId
    ) {
      alert('Please select a size');
      return false;
    }

    return true;
  };

  const buildCartItem = (product) => {
    const normalizedImage =
      product?.images?.[0]?.image ||
      product.image ||
      product.product_image ||
      '/medivila-default.jpg';

    let cartItem = {
      ...product,
      product_id: product.id,
      price: product.discount_price || product.price,
      image: normalizedImage,
      product_image: normalizedImage,
      images: product.images || [],
    };

    if (product.colors?.length > 0) {
      const selectedColor = product.colors.find(
        (c) => c.id === selectedOptions[product.id]?.colorId
      );
      const selectedSize = product.clothing
        ? selectedColor?.sizes?.find((s) => s.id === selectedOptions[product.id]?.sizeId)
        : null;

      cartItem = {
        ...cartItem,
        id: `${product.id}${selectedColor ? `-${selectedColor.id}` : ''}${
          selectedSize ? `-${selectedSize.id}` : ''
        }`,
        color: selectedColor?.color || null,
        colorId: selectedColor?.id || null,
        size: selectedSize?.size || null,
        sizeId: selectedSize?.id || null,
        image: selectedColor?.image || normalizedImage,
        product_image: selectedColor?.image || normalizedImage,
      };
    }

    if (product.single_product_sizes?.length > 0) {
      const selectedSize = product.single_product_sizes.find(
        (s) => s.id === selectedOptions[product.id]?.sizeId
      );

      cartItem = {
        ...cartItem,
        id: `${product.id}${selectedSize ? `-${selectedSize.id}` : ''}`,
        size: selectedSize?.size || null,
        sizeId: selectedSize?.id || null,
      };
    }

    if (!cartItem.id) {
      cartItem.id = product.id.toString();
    }

    return cartItem;
  };

  const getCurrentCartItemId = (product) => {
    if (product.colors?.length > 0) {
      const selectedColor = product.colors.find(
        (c) => c.id === selectedOptions[product.id]?.colorId
      );
      const selectedSize = product.clothing
        ? selectedColor?.sizes?.find((s) => s.id === selectedOptions[product.id]?.sizeId)
        : null;

      return `${product.id}${selectedColor ? `-${selectedColor.id}` : ''}${
        selectedSize ? `-${selectedSize.id}` : ''
      }`;
    }

    if (product.single_product_sizes?.length > 0) {
      const selectedSize = product.single_product_sizes.find(
        (s) => s.id === selectedOptions[product.id]?.sizeId
      );
      return `${product.id}${selectedSize ? `-${selectedSize.id}` : ''}`;
    }

    return product.id.toString();
  };

  const handleAddClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateProductSelection(product)) return;

    const currentId = getCurrentCartItemId(product);
    const existingItem = items.find((item) => item.id === currentId);

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
        show: true,
        quantity: newQuantity,
      },
    }));
  };

  const handleConfirmAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateProductSelection(product)) return;

    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const cartItem = buildCartItem(product);
    const existingItem = items.find((item) => item.id === cartItem.id);

    if (existingItem) {
      updateItemQuantity(existingItem.id, quantity);
    } else {
      addItem(cartItem, quantity);
    }

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: {
        show: false,
        quantity: 1,
      },
    }));
  };

  const handleCancelQuantity = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: {
        show: false,
        quantity: 1,
      },
    }));
  };

  if (headerLoading || productLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="bg-gradient-to-r from-[#116d3c] to-[#0a2635] py-10 text-center text-white">
        <h1 className="text-4xl font-bold">Shop</h1>
        <p className="mt-2 text-lg">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          / Shop
        </p>
      </div>

      <div className="bg-gray-50">
        <div className="container mx-auto py-6 px-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
            {[...products].reverse().map((product) => {
              const percentage = product.discount_price
                ? Math.round(
                    ((product.price - product.discount_price) / product.price) * 100
                  )
                : 0;

              const productOptions = selectedOptions[product.id] || {};
              const selectedColor = product.colors?.find(
                (c) => c.id === productOptions.colorId
              );
              const isDropdownOpen = openDropdowns[product.id];
              const hasColors = product.colors?.length > 0;
              const hasSizes = product.clothing && selectedColor?.sizes?.length > 0;
              const hasSingleSizes = product.single_product_sizes?.length > 0;
              const isSingleSizeProduct =
                hasSingleSizes && !hasColors && !product.clothing;

              const isQuantitySelectorOpen = showQuantitySelector[product.id]?.show;
              const quantity = showQuantitySelector[product.id]?.quantity || 1;
              const currentCartItemId = getCurrentCartItemId(product);
              const isAdded = addedItems[currentCartItemId];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-visible flex flex-col h-full relative border border-gray-100 group"
                >
                  {product.discount_price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full z-10 font-medium">
                      {percentage}% OFF
                    </span>
                  )}

                  <div className="relative aspect-square overflow-hidden bg-white rounded-t-lg">
                    <Link
                      to={`/${product.slug}`}
                      onClick={() => saveProductAnchor(product.slug, '/shop')}
                      data-product-scroll-key="/shop"
                      data-product-slug={product.slug}
                      className="block h-full w-full"
                    >
                      {hasColors ? (
                        <div className="h-full w-full">
                          <img
                            src={buildImageUrl(
                              config.imageUrl,
                              selectedColor?.image || product.colors[0]?.image
                            )}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={handleImageFallback}
                          />
                        </div>
                      ) : (
                        <img
                          src={buildImageUrl(config.imageUrl, product.images[0]?.image)}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={handleImageFallback}
                        />
                      )}
                    </Link>
                  </div>

                  <div className="p-2 md:p-3 flex flex-col flex-grow">
                    <h3 className="text-xs md:text-sm text-gray-700 font-medium line-clamp-2 text-center min-h-[32px] leading-tight">
                      {product.name}
                    </h3>

                    {isSingleSizeProduct && (
                      <div className="mt-2">
                        <label className="block text-[10px] text-gray-500 mb-1">
                          Size:
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {product.single_product_sizes.map((size) => (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => handleSizeSelect(product.id, size.id)}
                              className={`py-1 text-[10px] rounded ${
                                productOptions.sizeId === size.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              } transition-colors`}
                            >
                              {size.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(hasColors || hasSizes) > 0 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => toggleDropdown(product.id)}
                          className="w-full flex justify-between items-center px-2 py-2 bg-gray-100 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <span>Select Options</span>
                          {isDropdownOpen ? (
                            <FaChevronUp className="text-gray-500 text-[10px]" />
                          ) : (
                            <FaChevronDown className="text-gray-500 text-[10px]" />
                          )}
                        </button>

                        {isDropdownOpen && (
                          <div className="mt-2 space-y-2">
                            {hasColors && (
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1">
                                  Color:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {product.colors.map((color) => (
                                    <button
                                      key={color.id}
                                      type="button"
                                      onClick={() =>
                                        handleColorSelect(product.id, color.id)
                                      }
                                      className={`w-7 h-7 rounded-full border-2 ${
                                        productOptions.colorId === color.id
                                          ? 'border-blue-500'
                                          : 'border-gray-300'
                                      } transition-colors`}
                                      style={{
                                        backgroundColor: color.color.toLowerCase(),
                                      }}
                                      title={color.color}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {hasSizes && (
                              <div>
                                <label className="block text-[10px] text-gray-500 mb-1">
                                  Size:
                                </label>
                                <div className="grid grid-cols-4 gap-1">
                                  {selectedColor?.sizes?.map((size) => (
                                    <button
                                      key={size.id}
                                      type="button"
                                      onClick={() =>
                                        handleSizeSelect(product.id, size.id)
                                      }
                                      className={`py-1 text-[10px] rounded ${
                                        productOptions.sizeId === size.id
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                      } transition-colors`}
                                    >
                                      {size.size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-end justify-between mt-2 relative">
                      <div>
                        {product.discount_price ? (
                          <>
                            <p className="text-[10px] text-gray-400 line-through leading-none">
                              ৳{product.price}
                            </p>
                            <p className="text-sm font-bold text-green-600 leading-tight mt-1">
                              ৳{product.discount_price}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-green-600 leading-tight">
                            ৳{product.price}
                          </p>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        {isQuantitySelectorOpen ? (
                          <div className="absolute bottom-full right-0 mb-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 flex items-center gap-1 min-w-max">
                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuantityChange(e, product.id, quantity - 1)
                              }
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px]"
                              disabled={quantity <= 1}
                            >
                              <FaMinus className="text-[9px]" />
                            </button>

                            <span className="w-6 text-center font-medium text-[11px]">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={(e) =>
                                handleQuantityChange(e, product.id, quantity + 1)
                              }
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px]"
                            >
                              <FaPlus className="text-[9px]" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleConfirmAddToCart(e, product)}
                              className="px-2 py-1 bg-green-500 text-white rounded text-[10px] hover:bg-green-600 transition-colors font-medium"
                            >
                              OK
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleCancelQuantity(e, product.id)}
                              className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="text-[9px]" />
                            </button>
                          </div>
                        ) : (
                        <button
                          type="button"
                          onClick={(e) => handleAddClick(e, product)}
                          className={`product-add-button ${isAdded ? 'is-added' : ''}`}
                        >
                          <span className="w-full text-left text-xs md:text-sm">
                            {isAdded ? 'ADDED' : 'ADD'}
                          </span>
                        </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
      </div>

      <Footer />
    </>
  );
};

export default Shop;
