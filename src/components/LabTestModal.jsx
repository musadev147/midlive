import React, { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaInfoCircle,
  FaShoppingCart,
  FaCheck,
  FaStar,
} from "react-icons/fa";
import { MdBloodtype } from "react-icons/md";
import { config } from "../config"; // path project অনুযায়ী ঠিক করুন
import { handleImageFallback } from "../utils/image";

const LabTestModal = ({ isOpen, onClose, onAddToCart, testData }) => {
  const [patientCount, setPatientCount] = useState(1);
  const [selectedLab, setSelectedLab] = useState(null);
  const [currentLab, setCurrentLab] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const defaultTestData = {
    id: 1,
    name: "Serum Electrolyte",
    description: "Balancing Body Chemistry for Optimal Health",
    includes: "Includes 1 test",
    image: "/medivila-default.jpg",
    icon: MdBloodtype,
    originalPrice: 499,
    discountedPrice: 299,
    discount: "40% OFF",
    reportTime: "6-8 hours",
    labs: [],
  };

  const data = testData || defaultTestData;

  const getLabLogo = (lab) => {
    if (lab?.logo_url) return lab.logo_url;
    if (lab?.logo) {
      if (typeof lab.logo === "string" && lab.logo.startsWith("http")) {
        return lab.logo;
      }
      return `${config.apiUrl.replace("/api", "")}/storage/${lab.logo}`;
    }
    return "/medivila-default.jpg";
  };

  const normalizedLabs = useMemo(() => {
    if (!Array.isArray(data?.labs) || data.labs.length === 0) return [];

    return data.labs.map((lab) => ({
      id: lab.id,
      name: lab.name || "Unknown Lab",
      logo: getLabLogo(lab),
      originalPrice: Number(lab.original_price ?? lab.originalPrice ?? 0),
      discountedPrice: Number(lab.discounted_price ?? lab.discountedPrice ?? 0),
      rating: Number(lab.rating ?? 0),
      isRecommended: Boolean(
        lab.is_recommended ?? lab.isRecommended ?? false
      ),
    }));
  }, [data]);

  useEffect(() => {
    if (!isOpen) return;

    setPatientCount(1);
    setSelectedLab(null);

    if (normalizedLabs.length > 0) {
      const recommendedLab =
        normalizedLabs.find((lab) => lab.isRecommended) || normalizedLabs[0];
      setCurrentLab(recommendedLab);
      setSelectedLab(recommendedLab);
    } else {
      setCurrentLab(null);
      setSelectedLab(null);
    }
  }, [isOpen, data, normalizedLabs]);

  const handlePatientIncrease = () => {
    setPatientCount((prev) => Math.min(prev + 1, 10));
  };

  const handlePatientDecrease = () => {
    setPatientCount((prev) => Math.max(prev - 1, 1));
  };

  const handleLabSelect = (lab) => {
    setSelectedLab(lab);
    setCurrentLab(lab);
  };

  const handleAddToCart = async () => {
    if (!currentLab) {
      alert("No lab available for this test.");
      return;
    }

    try {
      setIsAdding(true);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const cartItem = {
        id: `${data.id}_${currentLab.id}_${Date.now()}`,
        testId: data.id,
        name: data.name,
        labId: currentLab.id,
        labName: currentLab.name,
        patientCount,
        price: currentLab.discountedPrice,
        originalPrice: currentLab.originalPrice,
        totalPrice: currentLab.discountedPrice * patientCount,
        discount: data.discount,
        quantity: patientCount,
        type: "lab_test",
        image: data.image,
        reportTime: data.reportTime || "6-8 hours",
        rating: currentLab.rating,
      };

      onAddToCart(cartItem);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  const IconComponent = data.icon || MdBloodtype;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fadeIn"
        onClick={onClose}
      ></div>

      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] w-full flex-col bg-white shadow-2xl animate-slideUp md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:animate-scaleIn">
        {/* Header */}
        <div className="relative flex-shrink-0 border-b border-gray-100 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:scale-110 hover:bg-gray-200"
          >
            <FaTimes className="h-4 w-4 text-gray-600" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
              <IconComponent className="h-8 w-8 text-blue-600" />
            </div>

            <div className="flex-1">
              <h2 className="mb-1 text-xl font-bold text-gray-800 md:text-2xl">
                {data.name}
              </h2>
              <p className="mb-1 text-sm text-gray-600">{data.description}</p>
              <p className="text-xs font-medium text-blue-600">
                {data.includes || "Includes 1 test"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Select Patients
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePatientDecrease}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
              >
                <FaMinus className="h-3 w-3 text-gray-600" />
              </button>

              <span className="min-w-[80px] text-center text-lg font-semibold text-gray-800">
                {patientCount} {patientCount === 1 ? "Patient" : "Patients"}
              </span>

              <button
                onClick={handlePatientIncrease}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50"
              >
                <FaPlus className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <FaInfoCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700">
              Only one lab can be selected per order. Choose your preferred
              diagnostic partner for this test.
            </p>
          </div>

          {/* Current Lab */}
          {currentLab ? (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Current Lab
              </h3>
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentLab.logo}
                    alt={currentLab.name}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={handleImageFallback}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {currentLab.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center">
                        <FaStar className="h-3 w-3 text-yellow-400" />
                        <span className="ml-0.5 text-xs text-gray-600">
                          {currentLab.rating}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-400 line-through">
                          ৳{currentLab.originalPrice}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ৳{currentLab.discountedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                  <FaCheck className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              No lab found for this test.
            </div>
          )}

          {/* Change Lab */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Change Lab
            </h3>

            {normalizedLabs.length > 0 ? (
              <div className="space-y-3">
                {normalizedLabs.map((lab) => (
                  <div
                    key={lab.id}
                    onClick={() => handleLabSelect(lab)}
                    className={`cursor-pointer rounded-xl p-3 transition-all duration-200 ${
                      selectedLab?.id === lab.id || currentLab?.id === lab.id
                        ? "border-2 border-blue-200 bg-blue-50"
                        : "border border-gray-200 bg-gray-50 hover:border-blue-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="lab"
                        checked={
                          selectedLab?.id === lab.id || currentLab?.id === lab.id
                        }
                        onChange={() => handleLabSelect(lab)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <img
                        src={lab.logo}
                        alt={lab.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={handleImageFallback}
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-800">
                            {lab.name}
                          </h4>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs text-gray-400 line-through">
                              ৳{lab.originalPrice}
                            </span>
                            <span className="text-base font-bold text-blue-600">
                              ৳{lab.discountedPrice}
                            </span>
                          </div>
                        </div>

                        {lab.isRecommended && (
                          <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                No labs available.
              </div>
            )}
          </div>

          <div className="h-4"></div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 rounded-b-2xl border-t border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total for {patientCount}{" "}
                {patientCount === 1 ? "Patient" : "Patients"}
              </span>
              <span className="text-xl font-bold text-blue-600">
                ৳{(currentLab?.discountedPrice || 0) * patientCount}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || !currentLab}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAdding ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        @media (min-width: 768px) {
          .animate-slideUp {
            animation: scaleIn 0.3s ease-out;
          }
        }
      `}</style>
    </>
  );
};

export default LabTestModal;



