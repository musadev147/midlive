import React from 'react';

import { FiMapPin, FiTruck, FiClock, FiDollarSign,FiInfo } from 'react-icons/fi';
import { useOrder } from '../../context/OrderContext';

const DistrictSelector = () => {
    const {
        districts = [],
        selectedDistrict,
        handleDistrictChange,
    } = useOrder();

    return (
        <div className="mb-6">
          
            {/* District selection section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="flex items-center text-lg font-semibold mb-4 text-gray-800">
                    <FiMapPin className="mr-2 text-green-600" />
                    ডেলিভারি এলাকা
                </label>

                {/* Loading state */}
                {districts.length === 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                        <span className="text-gray-600">ডেলিভারি জেলার তথ্য লোড হচ্ছে...</span>
                    </div>
                )}

                {/* District options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {districts.map((district) => (
                        <div 
                            key={district.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
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
                                        className="block font-medium text-gray-800 cursor-pointer"
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

                {/* Help text */}
                {!selectedDistrict && districts.length > 0 && (
                    <p className="mt-3 text-sm text-gray-500 flex items-center">
                        <FiInfo className="mr-1.5 text-blue-500" />
                        আপনার এলাকা সিলেক্ট করে ডেলিভারি চার্জ ও সময় দেখুন
                    </p>
                )}
            </div>
        </div>
    );
};

export default DistrictSelector;