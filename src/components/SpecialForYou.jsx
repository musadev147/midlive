import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { config } from '../config';
import UploadPrescriptionModal from './prescription';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import {
  buildOfferButtonStyle,
  buildOfferCardStyle,
  buildOfferCircleStyle,
  sortOffers,
} from '../utils/offerTheme';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SpecialForYou = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = config.apiUrl;
  const siteUrl = config.apiUrl.replace(/\/api\/?$/, '');

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/offers`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setOffers(sortOffers(data));
      setError(null);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const SectionHeader = () => (
    <div className="mb-0 sm:mb-3 text-center md:mb-7">
      <h3 className="text-sm font-bold text-gray-800 sm:text-xl sm:leading-6">
        Especially For You
      </h3>
    </div>
  );

  const handleOfferClick = (item) => {
    if (item.button_link === 'prescription') {
      setIsModalOpen(true);
    }
  };

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: offers.length > 6,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplay: offers.length > 6,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2.15,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const renderOfferAction = (item, index) => {
    if (item.button_link === 'prescription') {
      return (
        <button
          type="button"
          onClick={() => handleOfferClick(item)}
          className="w-full rounded-lg bg-white px-1 md:px-3 py-2 text-center text-sm font-semibold shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/95 md:text-sm"
          style={buildOfferButtonStyle(item, index)}
        >
          {item.button_text}
        </button>
      );
    }

    if (!item.button_link) {
      return (
        <span
          className="w-full rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold shadow-sm md:text-base"
          style={buildOfferButtonStyle(item, index)}
        >
          {item.button_text}
        </span>
      );
    }

    return (
      <a className="w-full" href={item.button_link}>
        <span
          className="flex w-full justify-center rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/95 md:text-base"
          style={buildOfferButtonStyle(item, index)}
        >
          {item.button_text}
        </span>
      </a>
    );
  };

  const renderOfferCard = (item, index) => {
    const accentStyle = buildOfferCardStyle(item, index);
    const circleStyle = buildOfferCircleStyle(item, index);
    const imageSrc = buildImageUrl(siteUrl, item.image);

    return (
      <article
        key={item.id}
        className="
          group relative flex h-[198px] w-full overflow-hidden rounded-xl
          rounded-tr-[72px] shadow-[0_14px_35px_rgba(15,23,42,0.08)]
          transition-transform duration-300 hover:-translate-y-1
        "
        style={accentStyle}
      >
        <div className="absolute right-0 top-0 h-full w-full bg-white/10" />
        <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-white/20 blur-[2px]" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-4 pb-4 pt-4 md:px-4 md:pb-4 md:pt-6">
          <div className="pr-14 md:pr-16">
            <p className="text-[14px] font-semibold text-black md:text-[16px]">
              {item.top_text || item.title || 'Offer'}
            </p>

            <div className="mt-6 md:mt-8">
              <p className="text-[14px] font-semibold text-black md:text-[16px]">
                {item.main_text || item.discount || 'N/A'}
              </p>

              {item.support_text || item.subtext ? (
                <p className="mt-1 text-[14px] text-black/90 md:text-[16px]">
                  {item.support_text || item.subtext}
                </p>
              ) : null}
            </div>
          </div>

          {renderOfferAction(item, index)}
        </div>

        <div className="absolute right-3 top-3 z-20">
          <div
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-white shadow-md md:h-16 md:w-16"
            style={circleStyle}
          >
            <img
              src={imageSrc}
              alt={item.top_text || item.title || 'Offer'}
              className="h-full w-full object-cover"
              onError={handleImageFallback}
            />
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <section className="w-full bg-white py-4 md:py-8 px-3 sm:px-4">
        <div className="mx-auto max-w-[1480px]">
          <SectionHeader />
          <div className="flex justify-center items-center h-52 md:h-64">
            <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white py-4 md:py-8 px-3 sm:px-4">
        <div className="mx-auto max-w-[1480px]">
          <SectionHeader />
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-red-500 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchOffers}
              className="mt-5 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="w-full bg-white py-4 md:py-8 px-3 sm:px-4">
        <div className="mx-auto max-w-[1480px]">
          <SectionHeader />
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-14 h-14 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No offers available right now.</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon for exciting deals.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white  md:py-8 px-3 sm:px-4 overflow-hidden">
      <div className="mx-auto max-w-[1480px]">
        <SectionHeader />

        <div className="relative">
          <div className="offer-slider-wrapper">
            <Slider {...sliderSettings}>
              {offers.map((item, index) => (
                <div key={item.id} className="px-1.5 py-1">
                  {renderOfferCard(item, index)}
                </div>
              ))}
            </Slider>
          </div>
        </div>

      </div>

      <style>{`
        .offer-slider-wrapper :global(.slick-list) {
          margin: 0 -6px;
        }

        .offer-slider-wrapper :global(.slick-track) {
          display: flex !important;
        }

        .offer-slider-wrapper :global(.slick-slide) {
          height: inherit !important;
        }

        .offer-slider-wrapper :global(.slick-slide > div) {
          height: 100%;
        }

        .offer-slider-wrapper :global(.slick-slide:focus) {
          outline: none;
        }

        .offer-slider-wrapper :global(.slick-dots) {
          bottom: -24px;
        }
      `}</style>

      <UploadPrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </section>
  );
};

export default SpecialForYou;
