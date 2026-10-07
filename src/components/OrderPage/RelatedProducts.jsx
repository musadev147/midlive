import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from 'react-use-cart';
import { config } from '../../config';
import CartPanel from '../CartPanel';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { buildImageUrl, handleImageFallback } from '../../utils/image';
import { saveProductAnchor } from '../../utils/scrollRestoration';
import SharedProductCard from '../ProductCard';
import ProductGrid from '../ProductGrid';
import CartTriggerButton from '../CartTriggerButton';

const RelatedProducts = ({ filterAllProducts, imageUrl, columns = 5 }) => {
  const location = useLocation();
  const { items, totalItems, addItem, updateItemQuantity, removeItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState({});

  const handleAddClick = (product) => {
    setShowQuantitySelector(prev => ({
      ...prev,
      [product.id]: {
        show: true,
        quantity: 1
      }
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setShowQuantitySelector(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity
      }
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = showQuantitySelector[product.id]?.quantity || 1;

    // Prepare cart item
    let cartItem = { 
      ...product, 
      product_id: product.id,
      price: product.discount_price || product.price,
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
      quantity: quantity
    };

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(item => item.id === cartItem.id);
    
    if (existingItemIndex !== -1) {
      const existingItem = items[existingItemIndex];
      updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      addItem(cartItem, quantity);
    }

    // Hide quantity selector after adding to cart
    setShowQuantitySelector(prev => ({
      ...prev,
      [product.id]: false
    }));
  };

  const handleCancelQuantity = (productId) => {
    setShowQuantitySelector(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  // Product Card Component - Mobile Responsive
  const ProductCard = ({ product }) => {
    const cardQuantitySelectorOpen = showQuantitySelector[product.id]?.show;
    const cardQuantity = cardQuantitySelectorOpen
      ? (showQuantitySelector[product.id]?.quantity || 1)
      : 1;
    const cardIsAdded = items.some(
      (item) => Number(item.product_id || item.id) === Number(product.id)
    );

    return (
      <SharedProductCard
        product={product}
        scrollKey={location.pathname}
        isAdded={cardIsAdded}
        isQuantitySelectorOpen={cardQuantitySelectorOpen}
        quantity={cardQuantity}
        onAddClick={(_, clickedProduct) => handleAddClick(clickedProduct)}
        onQuantityChange={(_, productId, newQuantity) => handleQuantityChange(productId, newQuantity)}
        onConfirmAddToCart={(_, clickedProduct) => handleAddToCart(clickedProduct)}
        onCancelQuantity={(_, productId) => handleCancelQuantity(productId)}
      />
    );

    const discountPercentage = product.discount_price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;

    const isQuantitySelectorOpen = showQuantitySelector[product.id]?.show;
    const quantity = isQuantitySelectorOpen ? (showQuantitySelector[product.id]?.quantity || 1) : 1;
    const isAdded = items.some(
      (item) => Number(item.product_id || item.id) === Number(product.id)
    );

    return (
      <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full relative group border border-gray-100">
        {/* Discount Badge - Mobile Responsive */}
        {product.discount_price && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 md:top-2 md:left-2 md:text-xs md:px-2 md:py-1">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Product Image - Mobile Responsive */}
        <div className="relative aspect-square overflow-hidden">
          <Link
            to={`/${product.slug}`}
            onClick={() => saveProductAnchor(product.slug, location.pathname)}
            data-product-scroll-key={location.pathname}
            data-product-slug={product.slug}
            className="block h-full w-full"
          >
            <img
              src={buildImageUrl(config.imageUrl, product.images[0]?.image)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={handleImageFallback}
            />
          </Link>
        </div>

        {/* Product Info - Mobile Responsive */}
        <div className="p-2 md:p-3 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-center text-xs md:text-sm leading-tight min-h-[2rem] flex items-center justify-center">
            {product.name}
          </h3>

          <div className='flex justify-between items-center mt-1 md:mt-2'>
            {/* Price - Mobile Responsive */}
            <div className="flex flex-col">
              {product.discount_price ? (
                <>
                  <span className="text-[10px] md:text-xs text-gray-400 line-through">৳{product.price}</span>
                  <span className="text-sm md:text-base font-bold text-green-600">৳{product.discount_price}</span>
                </>
              ) : (
                <span className="text-sm md:text-base font-bold text-green-600">৳{product.price}</span>
              )}
            </div>
            
            {/* Add to Cart Button or Quantity Selector - Mobile Responsive */}
            {!isQuantitySelectorOpen ? (
              <button
                onClick={() => handleAddClick(product)}
                className={`product-add-button ${isAdded ? 'is-added' : ''}`}
              >
                <span className="w-full text-left text-xs md:text-sm">{isAdded ? 'ADDED' : 'ADD'}</span>
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
                
                <span className="w-3 md:w-4 text-center font-medium text-[10px] md:text-xs">{quantity}</span>
                
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
  };

  return (
    <>
      {/* Related Products Section - Mobile Responsive */}
      {filterAllProducts.length > 0 && (
        <div className="mb-8 md:mb-16 px-2 md:px-0">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-6 border-b pb-2 text-center md:text-left">
            আরো দেখুন
          </h2>
          
          {/* Grid System - Mobile First */}
          <ProductGrid columns={columns}>
            {[...filterAllProducts].reverse().map((product) => {
              const isQuantitySelectorOpen = showQuantitySelector[product.id]?.show;
              const quantity = isQuantitySelectorOpen
                ? (showQuantitySelector[product.id]?.quantity || 1)
                : 1;
              const isAdded = items.some(
                (item) => Number(item.product_id || item.id) === Number(product.id)
              );

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  scrollKey={location.pathname}
                  isAdded={isAdded}
                  isQuantitySelectorOpen={isQuantitySelectorOpen}
                  quantity={quantity}
                  onAddClick={handleAddClick}
                  onQuantityChange={handleQuantityChange}
                  onConfirmAddToCart={handleAddToCart}
                  onCancelQuantity={handleCancelQuantity}
                />
              );
            })}
          </ProductGrid>
        </div>
      )}

      <CartTriggerButton items={items} onClick={() => setIsCartOpen(true)} />

      {/* Cart Panel */}
      <CartPanel
        isOpen={isCartOpen}
        toggleCart={() => setIsCartOpen(false)}
        cartItems={items}
        removeFromCart={removeItem}
        updateQuantity={updateItemQuantity}
      />
    </>
  );
};

export default RelatedProducts;
