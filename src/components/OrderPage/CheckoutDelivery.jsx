import React from 'react';
import { FiMapPin, FiTruck, FiClock, FiInfo } from 'react-icons/fi';
import { useOrder } from '../../context/OrderContext';

const CheckoutDelivery = ({ handleDistrictChange }) => {
  const { districts = [], selectedDistrict } = useOrder();

  return (
    <div className="mb-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-4 flex items-center text-lg font-semibold text-gray-800">
          <FiMapPin className="mr-2 text-green-600" />
          ডেলিভারি এলাকা
        </label>

        {districts.length === 0 && (
          <div className="flex items-center justify-center rounded-lg bg-gray-50 p-4">
            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
            <span className="text-gray-600">ডেলিভারি এলাকার তথ্য লোড হচ্ছে...</span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {districts.map((district) => (
            <div
              key={district.id}
              className={`cursor-pointer rounded-lg border p-3 transition-all ${
                selectedDistrict === district.district_name
                  ? 'border-green-500 bg-green-50 shadow-sm'
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => handleDistrictChange(district.district_name)}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  id={`district-${district.id}`}
                  name="deliveryDistrict"
                  value={district.district_name}
                  checked={selectedDistrict === district.district_name}
                  onChange={() => {}}
                  className="mt-1 mr-3 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`district-${district.id}`}
                    className="block cursor-pointer font-medium text-gray-800"
                  >
                    {district.district_name}
                  </label>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FiTruck className="mr-1.5 text-green-500" />
                      <span>
                        {district.delivery_charge === 0
                          ? 'ফ্রি ডেলিভারি'
                          : `${district.delivery_charge} টাকা`}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-1.5 text-green-500" />
                      <span>{district.estimated_days} কার্যদিবস</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!selectedDistrict && districts.length > 0 && (
          <p className="mt-3 flex items-center text-sm text-gray-500">
            <FiInfo className="mr-1.5 text-blue-500" />
            আপনার এলাকা সিলেক্ট করে ডেলিভারি চার্জ ও সময় দেখুন
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckoutDelivery;
