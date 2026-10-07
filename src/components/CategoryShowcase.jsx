import { useMemo } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const DEFAULT_TITLE = 'Shop by Category';
const ITEMS_PER_PAGE = 12;

const CategoryShowcase = ({
  categories = [],
  title = DEFAULT_TITLE,
  subtitle = null,
  layout = 'slider',
  padToMultiple = false,
  toggleSidebar,
  containerClassName = 'container mx-auto px-3 py-4 sm:px-4',
  titleClassName = 'text-sm font-bold text-gray-800 sm:text-2xl sm:leading-6',
  sliderClassName = 'category-slider-wrapper mt-1 sm:mt-5',
  gridClassName = 'mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  headingClassName = 'text-center',
}) => {
  const imageUrl = config.imageUrl;

  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories) || !categories.length) return [];

    if (!padToMultiple) {
      return categories.map((category) => ({
        category,
        isOriginal: true,
      }));
    }

    const targetCount =
      Math.ceil(categories.length / ITEMS_PER_PAGE) * ITEMS_PER_PAGE;
    const paddedCategories = [...categories];

    let fillerIndex = 0;
    while (paddedCategories.length < targetCount) {
      paddedCategories.push(categories[fillerIndex % categories.length]);
      fillerIndex += 1;
    }

    return paddedCategories.map((category, index) => ({
      category,
      isOriginal: index < categories.length,
    }));
  }, [categories, padToMultiple]);

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: categories.length > 5,
      speed: 500,
      slidesToShow: 6,
      slidesToScroll: 1,
      rows: 2,
      slidesPerRow: 1,
      autoplay: categories.length > 5,
      autoplaySpeed: 2500,
      pauseOnHover: true,
      arrows: false,
      swipeToSlide: true,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 1,
            rows: 2,
            slidesPerRow: 1,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 1,
            rows: 2,
            slidesPerRow: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            rows: 2,
            slidesPerRow: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            rows: 2,
            slidesPerRow: 1,
          },
        },
      ],
    }),
    [categories.length]
  );

  const handleCategoryClick = () => {
    if (window.innerWidth < 1024 && toggleSidebar) {
      toggleSidebar();
    }
  };

  const renderCategoryCard = (category, isOriginal = true, key) => {
    const categoryHref = `/category/${category.slug || category.id}`;

    return (
      <Link
        key={key}
        to={isOriginal ? categoryHref : '#'}
        onClick={handleCategoryClick}
        className={`group flex h-full flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 ${
          !isOriginal ? 'pointer-events-none' : ''
        }`}
        aria-label={`Browse ${category.name} category`}
      >
        <div
          className={`rounded-[26px] border border-gray-100 bg-white p-0.5 shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)] ${
            layout === 'grid' ? 'w-full' : ''
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-[22px] bg-slate-50 ${
              layout === 'grid'
                ? 'aspect-square w-full'
                : 'aspect-square w-[80px] sm:w-[150px] md:w-[170px] lg:w-[185px]'
            }`}
          >
            {category.image ? (
              <img
                src={buildImageUrl(imageUrl, category.image)}
                alt={category.name}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                onError={handleImageFallback}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No Image
              </div>
            )}
          </div>
        </div>

        <h3
          className={`mt-2 min-h-[2.5rem] text-center text-sm font-medium leading-tight text-gray-800 transition-colors line-clamp-2 group-hover:text-primary ${
            layout === 'grid' ? 'max-w-full' : 'max-w-[92px] sm:min-h-0 sm:max-w-none'
          }`}
        >
          {category.name}
        </h3>
      </Link>
    );
  };

  if (!displayCategories.length) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <div className={headingClassName}>
        <h2 className={titleClassName}>{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500 sm:mt-2">{subtitle}</p>
        ) : null}
      </div>

      {layout === 'grid' ? (
        <div className={gridClassName}>
          {displayCategories.map(({ category, isOriginal }, index) =>
            renderCategoryCard(category, isOriginal, `${category.id}-${index}`)
          )}
        </div>
      ) : (
        <div className={sliderClassName}>
          <Slider {...settings}>
            {displayCategories.map(({ category, isOriginal }, index) => (
              <div
                key={`${category.id}-${index}`}
                className="px-0.5 py-2 sm:px-3"
              >
                {renderCategoryCard(category, isOriginal)}
              </div>
            ))}
          </Slider>
        </div>
      )}

      {layout === 'slider' && (
        <style>{`
          .category-slider-wrapper :global(.slick-list) {
            margin: 0 -6px;
          }

          .category-slider-wrapper :global(.slick-track) {
            display: flex !important;
          }

          .category-slider-wrapper :global(.slick-slide) {
            height: inherit !important;
          }

          .category-slider-wrapper :global(.slick-slide > div) {
            height: 100%;
          }

          .category-slider-wrapper :global(.slick-slide:focus) {
            outline: none;
          }

          @media (max-width: 480px) {
            .category-slider-wrapper :global(.slick-list) {
              margin: 0 -4px;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default CategoryShowcase;
