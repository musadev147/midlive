import React, { useState } from 'react';
import { config } from '../config';
import { Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { useCart } from 'react-use-cart';
import Footer from '../components/Footer';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import { saveProductAnchor } from '../utils/scrollRestoration';
import CartTriggerButton from '../components/CartTriggerButton';

const Search = ({ products = [] }) => {
  const [showQuantitySelector, setShowQuantitySelector] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { items, totalItems, addItem, updateItemQuantity } = useCart();

  const handleAddClick = (product) => {
    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: {
        show: true,
        quantity: 1,
      },
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity,
      },
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = showQuantitySelector[product.id]?.quantity || 1;
    const normalizedImage =
      product?.images?.[0]?.image ||
      product.image ||
      product.product_image ||
      '/medivila-default.jpg';

    const cartItem = {
      ...product,
      product_id: product.id,
      price: product.discount_price || product.price,
      id: product.id.toString(),
      image: normalizedImage,
      product_image: normalizedImage,
      images: product.images || [],
      quantity,
    };

    const existingItemIndex = items.findIndex((item) => item.id === cartItem.id);

    if (existingItemIndex !== -1) {
      const existingItem = items[existingItemIndex];
      updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      addItem(cartItem, quantity);
    }

    setShowQuantitySelector((prev) => ({
      ...prev,
      [product.id]: false,
    }));

    alert('Product added to cart!');
  };

  const handleCancelQuantity = (productId) => {
    setShowQuantitySelector((prev) => ({
      ...prev,
      [productId]: false,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 lg:gap-6">
            {products.map((product) => {
              const discountPercentage = product.discount_price
                ? Math.round(((product.price - product.discount_price) / product.price) * 100)
                : 0;

              const isQuantitySelectorOpen = showQuantitySelector[product.id]?.show;
              const quantity = isQuantitySelectorOpen
                ? showQuantitySelector[product.id]?.quantity || 1
                : 1;

              const hasColors = product.colors?.length > 0;
              const hasImages = product.images?.length > 0;
              const isAdded = items.some(
                (item) => Number(item.product_id || item.id) === Number(product.id)
              );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full relative group border border-gray-100"
                >
                  {product.discount_price && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 md:top-2 md:left-2 md:text-xs md:px-2 md:py-1">
                      {discountPercentage}% OFF
                    </div>
                  )}

                  <div className="relative aspect-square overflow-hidden">
                    <Link
                      to={`/${product.slug}`}
                      onClick={() => saveProductAnchor(product.slug, 'medivila:search-product-anchor')}
                      data-product-scroll-key="medivila:search-product-anchor"
                      data-product-slug={product.slug}
                      className="block h-full w-full"
                    >
                      {hasColors ? (
                        <div className="h-full w-full">
                          <img
                            src={buildImageUrl(
                              config.imageUrl,
                              product.colors[0]?.image
                            )}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={handleImageFallback}
                          />
                        </div>
                      ) : hasImages ? (
                        <img
                          src={buildImageUrl(config.imageUrl, product.images[0]?.image)}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={handleImageFallback}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </Link>
                  </div>

                  <div className="p-2 md:p-3 flex flex-col flex-grow">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-center text-xs md:text-sm leading-tight min-h-[2rem] flex items-center justify-center">
                      {product.name}
                    </h3>

                    <div className="flex justify-between items-center mt-1 md:mt-2">
                      <div className="flex flex-col">
                        {product.discount_price ? (
                          <>
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">
                              ৳{product.price}
                            </span>
                            <span className="text-sm md:text-base font-bold text-green-600">
                              ৳{product.discount_price}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm md:text-base font-bold text-green-600">
                            ৳{product.price}
                          </span>
                        )}
                      </div>

                      {!isQuantitySelectorOpen ? (
                        <button
                          onClick={() => handleAddClick(product)}
                          className={`product-add-button ${isAdded ? 'is-added' : ''}`}
                        >
                          <span className="w-full text-left text-xs md:text-sm">
                            {isAdded ? 'ADDED' : 'ADD'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-gray-200 md:space-x-2 md:p-1">
                          <button
                            onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 text-[8px] md:text-xs"
                            disabled={quantity <= 1}
                          >
                            <FaMinus className="text-[8px] md:text-xs" />
                          </button>

                          <span className="w-3 md:w-4 text-center font-medium text-[10px] md:text-xs">
                            {quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-gray-300 rounded-md bg-gray-100 hover:bg-gray-200 text-[8px] md:text-xs"
                          >
                            <FaPlus className="text-[8px] md:text-xs" />
                          </button>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-1 py-0.5 bg-green-500 text-white rounded text-[8px] md:text-xs hover:bg-green-600 transition-colors ml-0.5 md:ml-1 md:px-1.5 md:py-0.5"
                          >
                            ADD
                          </button>

                          <button
                            onClick={() => handleCancelQuantity(product.id)}
                            className="px-1 py-0.5 bg-red-500 text-white rounded text-[8px] md:text-xs hover:bg-red-600 transition-colors md:px-1.5 md:py-0.5"
                          >
                            X
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
              <div className="flex justify-center mb-6">
                <FaShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                No Products Found
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your search. Try different keywords or browse our categories.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      <CartTriggerButton items={items} onClick={() => setIsCartOpen(true)} />

      <Footer />
    </div>
  );
};

export default Search;
