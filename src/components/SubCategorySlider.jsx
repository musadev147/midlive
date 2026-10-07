import React, { useContext } from 'react';
import Slider from 'react-slick';
import { FaLayerGroup } from 'react-icons/fa';
import { ProductContext } from '../context/ProductsContext';
import { config } from '../config';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SubCategorySlider = ({ subCategories, currentCategory }) => {
  const { filterProductsByCategory, selectedCategory } = useContext(ProductContext);
  const imageUrl = config.imageUrl;

  const handleSubCategoryClick = (categoryId) => {
    filterProductsByCategory(categoryId);
  };

  function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} z-10 hidden lg:block`}
        style={{
          ...style,
          left: '-15px',
          width: '40px',
          height: '40px',
        }}
        onClick={onClick}
      >
        <div className="w-full h-full bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </div>
    );
  }

  function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} z-10 hidden lg:block`}
        style={{
          ...style,
          right: '-15px',
          width: '40px',
          height: '40px',
        }}
        onClick={onClick}
      >
        <div className="w-full h-full bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    dots: false,
    infinite: subCategories.length > 10,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    rows: 2,
    slidesPerRow: 1,
    arrows: subCategories.length > 10,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          rows: 2,
          slidesPerRow: 1,
          arrows: false,
          dots: subCategories.length > 8,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          rows: 2,
          slidesPerRow: 1,
          arrows: false,
          dots: subCategories.length > 8,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          rows: 2,
          slidesPerRow: 1,
          arrows: false,
          dots: subCategories.length > 8,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          rows: 2,
          slidesPerRow: 1,
          arrows: false,
          dots: subCategories.length > 8,
        },
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaLayerGroup className="text-blue-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
              Sub Categories
            </h3>
            <p className="text-gray-600 text-sm">
              Explore more from {currentCategory?.name}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500 lg:text-right">
          {subCategories.length} subcategories
        </div>
      </div>

      <div className="relative lg:px-4 subcategory-slider-wrapper">
        <Slider {...sliderSettings}>
          {subCategories.map((category) => (
            <div key={category.id} className="px-1.5 py-2">
              <button
                onClick={() => handleSubCategoryClick(category.id)}
                className={`group flex flex-col items-center p-2 lg:p-3 rounded-lg lg:rounded-xl w-full transition-all duration-300 transform hover:scale-105 ${
                  Number(selectedCategory) === Number(category.id)
                    ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-white hover:shadow-md hover:border-gray-200'
                }`}
              >
                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 mb-2 rounded-lg lg:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    Number(selectedCategory) === Number(category.id)
                      ? 'border-white bg-white shadow-inner'
                      : 'border-gray-200 bg-white group-hover:border-gray-300'
                  }`}
                >
                  <img
                    src={buildImageUrl(imageUrl, category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={handleImageFallback}
                  />
                </div>

                <span
                  className={`text-[11px] lg:text-xs font-medium text-center line-clamp-2 transition-colors px-1 min-h-[32px] ${
                    Number(selectedCategory) === Number(category.id)
                      ? 'text-white font-semibold'
                      : 'text-gray-700 group-hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </span>
              </button>
            </div>
          ))}
        </Slider>
      </div>

      <style>{`
        .subcategory-slider-wrapper :global(.slick-list) {
          margin: 0 -6px;
        }

        .subcategory-slider-wrapper :global(.slick-track) {
          display: flex !important;
        }

        .subcategory-slider-wrapper :global(.slick-slide) {
          height: inherit !important;
        }

        .subcategory-slider-wrapper :global(.slick-slide > div) {
          height: 100%;
        }

        .subcategory-slider-wrapper :global(.slick-slide:focus) {
          outline: none;
        }

        .subcategory-slider-wrapper :global(.slick-dots) {
          bottom: -22px;
        }

        .subcategory-slider-wrapper :global(.slick-dots li button:before) {
          font-size: 8px;
          color: #9ca3af;
          opacity: 0.5;
        }

        .subcategory-slider-wrapper
          :global(.slick-dots li.slick-active button:before) {
          color: #16a34a;
          opacity: 1;
        }

        @media (max-width: 480px) {
          .subcategory-slider-wrapper :global(.slick-list) {
            margin: 0 -4px;
          }
        }
      `}</style>
    </div>
  );
};

export default SubCategorySlider;

