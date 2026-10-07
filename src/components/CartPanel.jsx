import React, { useContext, useEffect } from 'react';
import { useCart } from 'react-use-cart';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaFlask, FaHeartbeat, FaShoppingCart } from 'react-icons/fa';
import { config } from '../config';
import { initFacebookPixel, initFacebookPixels, trackEvent, trackEventOnMultiplePixels } from '../pixel';
import { ProductContext } from '../context/ProductsContext';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import { Link } from 'react-router-dom';

const CartPanel = ({ isOpen, toggleCart }) => {
  const {
    isEmpty,
    items,
    updateItemQuantity,
    removeItem,
    cartTotal = 0, // Default value added
  } = useCart();

  const imageUrl = config.imageUrl;
  const { pixel } = useContext(ProductContext);

  // Calculate total manually if cartTotal is not available
  const calculateTotal = () => {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total, item) => {
      if (item.type === 'lab_test') {
        return total + (item.price * (item.quantity || item.patientCount || 1));
      }
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const finalTotal = calculateTotal();

  // Pixel initialization and AddToCart tracking
  useEffect(() => {
    initFacebookPixels(pixel);
    if (!isEmpty && pixel && pixel.length > 0 && items && items.length > 0) {
      trackEventOnMultiplePixels(pixel, 'AddToCart', {
        content_ids: items.map(item => item.id),
        content_type: 'product',
        num_items: items.reduce((total, item) => total + getItemQuantity(item), 0),
        value: finalTotal,
        currency: 'BDT'
      });
    }
  }, [pixel, items, isEmpty, finalTotal]);

  // Function to get item quantity (supports both regular products and lab tests)
  const getItemQuantity = (item) => {
    if (!item) return 1;
    if (item.type === 'lab_test') {
      return item.quantity || item.patientCount || 1;
    }
    return item.quantity || 1;
  };

  // Function to update item quantity
  const handleUpdateQuantity = (item, newQuantity) => {
    if (!item) return;

    updateItemQuantity(item.id, newQuantity);
  };

  // Function to get item price display
  const getItemPrice = (item) => {
    if (!item) return 0;
    if (item.type === 'lab_test') {
      return (item.price || 0) * (item.quantity || item.patientCount || 1);
    }
    return (item.price || 0) * (item.quantity || 1);
  };

  if (!items) {
    return null;
  }

  return (
    <div className="relative">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={toggleCart}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              আপনার শপিং কার্ট
              {!isEmpty && items && items.length > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({items.reduce((total, item) => total + getItemQuantity(item), 0)} items)
                </span>
              )}
            </h2>
            <button onClick={toggleCart} className="text-gray-400 hover:text-gray-500">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {!items || items.length === 0 ? (
              <div className="text-center py-12">
                {/* <div className="flex justify-center mb-4">
                  <FaShoppingCart className="h-16 w-16 text-gray-300" />
                </div> */}
                <h3 className="mt-2 text-lg font-medium text-gray-900">আপনার কার্ট খালি</h3>
                <p className="mt-1 text-gray-500">কিছু পণ্য বা ল্যাব টেস্ট কার্টে যোগ করুন</p>
                <button
                  onClick={toggleCart}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  শপিং চালিয়ে যান
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6">
                    {/* Item Image */}
                    {item.type === 'lab_test' ? (
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={handleImageFallback}
                          />
                        ) : (
                          <FaFlask className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                    ) : (
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={buildImageUrl(imageUrl, item.images[0]?.image)}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={handleImageFallback}
                          />
                        ) : (
                          item.image && (
                            <img
                              src={buildImageUrl(imageUrl, item.image)}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                              onError={handleImageFallback}
                            />
                          )
                        )}
                      </div>
                    )}

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="ml-4 text-sm font-medium">
                            ৳{getItemPrice(item).toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Lab Test Specific Info */}
                        {item.type === 'lab_test' && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">
                              Lab: {item.labName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{item.price} per patient
                            </p>
                            {item.reportTime && (
                              <p className="text-xs text-green-600 mt-1">
                                Report in {item.reportTime}
                              </p>
                            )}
                            {item.discount && (
                              <p className="text-xs text-orange-500 mt-1">
                                {item.discount} off
                              </p>
                            )}
                          </div>
                        )}

                        {/* Regular Product Info */}
                        {item.type !== 'lab_test' && (
                          <>
                            <p className="mt-1 text-sm text-gray-500">
                              ৳{item.price} প্রতি পিস
                            </p>
                            {item.color && (
                              <p className="text-sm text-gray-500">Color: {item.color}</p>
                            )}
                            {item.size && (
                              <p className="text-sm text-gray-500">Size: {item.size}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex flex-1 items-end justify-between text-sm mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleUpdateQuantity(item, getItemQuantity(item) - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={getItemQuantity(item) <= 1}
                          >
                            <FaMinus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm min-w-[30px] text-center">
                            {getItemQuantity(item)}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item, getItemQuantity(item) + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <FaPlus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          className="font-medium text-red-600 hover:text-red-500 flex items-center text-sm transition-colors"
                          onClick={() => removeItem(item.id)}
                        >
                          <FaTrash className="mr-1 h-3 w-3" />
                          মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items && items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>সর্বমোট</p>
                <p>৳{finalTotal.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                শিপিং এবং ট্যাক্স চেকআউটে গণনা করা হবে
              </p>
              
              {/* Order Summary for Lab Tests */}
              {items.some(item => item.type === 'lab_test') && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    📋 Lab tests are subject to home sample collection availability in your area.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="flex items-center justify-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  চেকআউট করুন
                </Link>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                <p>
                  অথবা{' '}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    onClick={toggleCart}
                  >
                    শপিং চালিয়ে যান <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
        
        .transform {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CartPanel;

