import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaHeartbeat,
  FaTint,
  FaMicroscope,
  FaVial,
  FaSyringe,
  FaFlask,
  FaShoppingCart,
} from "react-icons/fa";
import { MdScience, MdBloodtype, MdBiotech } from "react-icons/md";
import { useCart } from "react-use-cart";
import LabTestModal from "./LabTestModal";
import CartPanel from "./CartPanel";
import { config } from "../config";
import CartTriggerButton from "./CartTriggerButton";

const DEFAULT_IMAGE_FALLBACK = "/medivila-default.jpg";

const iconMap = {
  MdBloodtype,
  FaHeartbeat,
  FaTint,
  FaMicroscope,
  FaVial,
  FaSyringe,
  FaFlask,
  MdScience,
  MdBiotech,
};

const toneClasses = [
  "from-[#eaf9ff] via-[#eaf9ff] to-[#ffffff]",
  "from-[#f2fced] via-[#f2fced] to-[#ffffff]",
  "from-[#eceef5] via-[#eceef5]/40 to-[#ffffff]",
  "from-[#b3d7f7] via-[#b3d7f7]/40 to-[#ffffff]",
  "from-[#FEF9C4] via-[#FEF9C4]/40 to-[#ffffff]",
  "from-[#FFEBFB] via-[#FFEBFB]/40 to-[#ffffff]",
];

const LabTest = () => {
  const scrollRef = useRef(null);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, addItem, totalItems } = useCart();

  const API_URL = `${config.apiUrl}/lab-tests`;

  const getImageUrl = (item) => {
    if (item?.image_url) return item.image_url;
    if (item?.image) {
      if (item.image.startsWith("http")) return item.image;
      return `${config.apiUrl.replace("/api", "")}/storage/${item.image}`;
    }
    return DEFAULT_IMAGE_FALLBACK;
  };

  const getIconComponent = (iconName) => iconMap[iconName] || MdBloodtype;

  const normalizeTest = (item) => ({
    ...item,
    image: getImageUrl(item),
    icon: getIconComponent(item?.icon),
    originalPrice: Number(item?.original_price || 0),
    discountedPrice: Number(item?.discounted_price || 0),
    discount: item?.discount || "OFF",
    reportTime: item?.report_time || "N/A",
    bookingCount: item?.booking_count || "0+",
    rating: Number(item?.rating || 0),
    description: item?.description || "No description available",
    labs: Array.isArray(item?.labs) ? item.labs : [],
  });

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setLabTests(data.map(normalizeTest));
    } catch (err) {
      console.error("Error fetching lab tests:", err);
      setError("Failed to load lab tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  const handleBookTest = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleAddToCart = (cartItem) => {
    addItem(cartItem);
    setIsModalOpen(false);

    setTimeout(() => {
      setIsCartOpen(true);
    }, 300);
  };

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const amount = Math.max(320, Math.min(container.clientWidth * 0.88, 420));
    container.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const renderCard = (test, index) => {
    const IconComponent = test.icon || MdBloodtype;
    const tone = toneClasses[index % toneClasses.length];

    return (
      <div
        key={test.id ?? index}
        role="button"
        tabIndex={0}
        onClick={() => handleBookTest(test)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBookTest(test);
          }
        }}
        className={`
        group relative block
        min-w-[260px] sm:min-w-[320px] md:min-w-[350px]
        h-36 sm:h-40
        snap-start overflow-hidden
        rounded-md sm:rounded-sm
        p-3 sm:p-4
        cursor-pointer
        border border-black/5
        shadow-[0_8px_28px_rgba(15,23,42,0.08)]
        transition-transform duration-300
        bg-gradient-to-br ${tone}
      `}
      >
        {/* LEFT CONTENT */}
        <div className="relative z-10 flex h-full flex-col pr-20 sm:pr-24">
          <span className="text-[11px] sm:text-sm font-normal text-zinc-700">
            {test.lab_name || test.category || "Home"}
          </span>

          <p className="mb-2 sm:mb-4 max-w-[150px] sm:max-w-[180px] text-sm sm:text-base font-semibold leading-tight text-zinc-700">
            {test.name}
          </p>

          <button
            type="button"
            onClick={() => handleBookTest(test)}
            className="
            inline-flex w-fit items-center
            rounded-sm border border-primary
            bg-white px-2 py-[2px] sm:py-1
            text-[10px] sm:text-xs font-medium text-primary
          "
          >
            Book
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="M7 7h10v10"></path>
              <path d="M7 17 17 7"></path>
            </svg>
          </button>
        </div>

        {/* RIGHT IMAGE + PRICE */}
        <div className="absolute inset-y-0 right-0 w-[45%] min-w-[120px] sm:min-w-[145px]">

          {/* PRICE BADGE */}
          <div className="
          absolute top-2 right-2
          flex items-center gap-1
          bg-white/80 backdrop-blur-sm
          px-2 py-[3px] sm:py-[4px]
          rounded-sm border border-zinc-200
        ">
            <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-none">
              ৳ {test.discountedPrice?.toFixed(2)}
            </span>

            {test.originalPrice > test.discountedPrice ? (
              <span className="text-[10px] sm:text-xs line-through text-red-400 leading-none">
                ৳ {test.originalPrice?.toFixed(2)}
              </span>
            ) : null}
          </div>

          {/* IMAGE */}
          <img
            alt={test.name}
            loading="lazy"
            className="
            absolute bottom-0 right-0
            h-[90px] w-[90px]
            sm:h-[120px] sm:w-[120px]
            object-contain
            transition-transform duration-300
            group-hover:scale-110
          "
            src={test.image}
            onError={(e) => {
              if (e.currentTarget.dataset.fallbackApplied === "true") return;
              e.currentTarget.dataset.fallbackApplied = "true";
              e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
            }}
          />

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10" />
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-80" />
        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black/5 to-transparent" />
        <div className="absolute left-0 bottom-0 h-10 w-full bg-gradient-to-t from-black/5 to-transparent" />
      </div>
    );
  };

  const hasTests = labTests.length > 0;

  return (
    <section id="lab-test" className="w-full  lg:py-2">
      <div className="container mx-auto  px-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByAmount("prev")}
            className="absolute -left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 shadow-md transition-all duration-300 hover:bg-white hover:text-primary"
            aria-label="Scroll previous lab tests"
          >
            <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount("next")}
            className="absolute -right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 shadow-md transition-all duration-300 hover:bg-white hover:text-primary"
            aria-label="Scroll next lab tests"
          >
            <FaChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth"
          >
            {loading ? (
              <div className="flex h-40 w-full items-center justify-center rounded-sm bg-white/70">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : error ? (
              <div className="flex w-full items-center justify-between rounded-sm bg-white/80 p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Lab tests unavailable</p>
                  <p className="text-xs text-zinc-500">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={fetchLabTests}
                  className="rounded-xs border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary"
                >
                  Try Again
                </button>
              </div>
            ) : hasTests ? (
              labTests.map((test, index) => renderCard(test, index))
            ) : (
              <div className="flex w-full items-center justify-center rounded-sm bg-white/80 p-6 text-sm text-zinc-500 shadow-sm">
                No lab tests available
              </div>
            )}
          </div>
        </div>
      </div>

      <LabTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
        testData={selectedTest}
      />

      <CartTriggerButton items={items} onClick={() => setIsCartOpen(true)} />

      <CartPanel
        isOpen={isCartOpen}
        toggleCart={() => setIsCartOpen(false)}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .rounded-xs {
          border-radius: 2px;
        }

        @media (max-width: 640px) {
          .container.mx-auto.mt-16.px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
};

export default LabTest;
