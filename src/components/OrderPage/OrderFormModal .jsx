import React from 'react';
import { FaTimes, FaShoppingCart, FaTruck } from 'react-icons/fa';
import { config } from '../../config';  
import { buildImageUrl, handleImageFallback } from '../../utils/image';
const imageUrl = config.imageUrl;


const OrderFormModal = ({ 
  isOpen, 
  onClose, 
  products, 
  name, 
  phone, 
  address, 
  selectedDivisionName, 
  selectedDistrictName, 
  selectedDivision,
  divisions, 
  districts, 
  setName, 
  setPhone, 
  setAddress, 
  setSelectedDivision, 
  setSelectedDivisionName, 
  setSelectedDistrictName,
  handleSubmit,
  isSubmitting,
  quantity,
  selectedSize,
  selectedColor,
  renderPaymentMethods,
  priceDetails,
  useCoins,
  setUseCoins,
  userPoints,
  bonus,
  coinsToUse,
  handleCoinUsage,
  pointsMessage,
  selectedPayment,
  selectedPaymentMethod,
  paymentNumber,
  transactionId,
  setPaymentNumber,
  setTransactionId,
  setSelectedPaymentMethod,
  setSelectedPayment,
  deliveryCharge,
  estimatedDays,
  selectedDistrict
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-xl p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">অর্ডার ফর্ম পূরণ করুন</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Product Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">আপনার অর্ডার</h3>
              <div className="flex items-center space-x-3">
                {products.images && products.images.length > 0 && (
                  <img 
                    src={buildImageUrl(imageUrl, products.images[0].image)} 
                    alt={products.name}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={handleImageFallback}
                  />
                )}
                <div>
                  <p className="font-medium">{products.name}</p>
                  <p className="text-sm text-gray-600">
                    পরিমাণ: {quantity} | 
                    {selectedColor && ` কালার: ${selectedColor}`} | 
                    {selectedSize && ` সাইজ: ${selectedSize}`}
                  </p>
                  <p className="text-green-600 font-semibold">
                    ৳{products.discount_price ? products.discount_price * quantity : products.price * quantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  আপনার নাম:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="পূর্ণ নাম লিখুন"
                  required
                />
              </div>

              {/* বিভাগ সিলেক্ট */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  আপনার বিভাগ সিলেক্ট করুন:
                </label>
                <div className="relative">
                  <select
                    value={selectedDivisionName}
                    onChange={(e) => {
                      const selectedOption = e.target.options[e.target.selectedIndex];
                      setSelectedDivision(selectedOption.id);
                      setSelectedDivisionName(selectedOption.value);
                      setSelectedDistrictName('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                  >
                    <option value="">বিভাগ সিলেক্ট করুন</option>
                    {divisions.map((division) => (
                      <option key={division.id} id={division.id} value={division.name}>
                        {division.bn_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* জেলা সিলেক্ট */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  আপনার জেলা সিলেক্ট করুন:
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrictName}
                    onChange={(e) => setSelectedDistrictName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                    disabled={!selectedDivision}
                  >
                    <option value="">জেলা সিলেক্ট করুন</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.bn_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  আপনার গ্রাম/রোড:
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="বিস্তারিত ঠিকানা (থানা, গ্রাম/রোড)"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Payment Methods */}
            {renderPaymentMethods()}

            {/* Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all transform hover:scale-[1.01] flex items-center justify-center space-x-2 text-lg font-bold shadow-lg hover:shadow-xl ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  প্রসেসিং...
                </>
              ) : (
                <>
                  <FaShoppingCart className="text-xl" />
                  <span>অর্ডার নিশ্চিত করুন</span>
                </>
              )}
            </button>

            {/* Delivery Info */}
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <FaTruck className="mr-2 text-blue-500" />
              <span className="font-medium">
                {selectedDistrict 
                  ? `${selectedDistrict}-এ আনুমানিক ডেলিভারি সময়: ${estimatedDays} কার্যদিবস`
                  : 'দ্রুত ডেলিভারি - ২৪ থেকে ৭২ ঘন্টার মধ্যে'
                }
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OrderFormModal;
