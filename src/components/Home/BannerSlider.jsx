import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { config } from '../../config';

const BannerSlider = ({ banners }) => {
  const sliderRef = useRef(null);
  const imageUrl = (config.imageUrl || '').replace(/\/$/, '');
  const defaultBannerImage = '/medivila-default.jpg';

  const normalizeText = (value) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const lowered = trimmed.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined') return '';
    return trimmed;
  };

  const resolveImage = (value) => {
    if (typeof value !== 'string') return defaultBannerImage;

    const trimmed = value.trim();
    if (!trimmed) return defaultBannerImage;

    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('/')) {
      return trimmed;
    }

    return `${imageUrl}/${trimmed.replace(/^\/+/, '')}`;
  };

  const validBanners = Array.isArray(banners)
    ? banners.filter((banner) => banner && typeof banner.image === 'string' && banner.image.trim())
    : [];

  const slides = validBanners.length > 0
    ? validBanners
    : [
      {
        id: 'fallback-banner',
        title: 'Medivila banner',
        image: defaultBannerImage,
        link: '',
      },
    ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (sliderRef.current?.slickGoTo) {
      sliderRef.current.slickGoTo(0, true);
    }
  }, [slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];

  const isExternalLink = (value) => /^https?:\/\//i.test(value);

  const settings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 650,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 4500,
    arrows: false,
    fade: true,
    cssEase: 'ease-in-out',
    adaptiveHeight: false,
    pauseOnHover: true,
    swipeToSlide: true,
    beforeChange: (_, next) => setActiveIndex(next),
    customPaging: (index) => (
      <button
        type="button"
        aria-label={`Go to slide ${index + 1}`}
        className="banner-slider-dot"
      />
    ),
    appendDots: (dots) => (
      <div className="banner-slider__indicators" aria-label="Banner slides">
        <ul>{dots}</ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          dots: true,
        },
      },
    ],
  };

  const goPrev = () => sliderRef.current?.slickPrev();
  const goNext = () => sliderRef.current?.slickNext();

  return (
    <section className="banner-slider-shell">
      <div className="banner-slider-stage">
        <div
          className="banner-slider-backdrop"
          // style={{ backgroundImage: `url('${activeBackdrop}')` }}
          aria-hidden="true"
        />

        <div className="banner-slider-viewport">
          <button
            type="button"
            className="banner-slider__nav banner-slider__nav--prev"
            onClick={goPrev}
            aria-label="Previous slide"
            disabled={slides.length < 2}
          >
            <span className="banner-slider__navIcon" aria-hidden="true">
              <svg viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.94741 12.707C7.76776 12.5194 7.66683 12.2651 7.66683 12C7.66683 11.7348 7.76776 11.4805 7.94741 11.293L13.3687 5.63598C13.4571 5.54047 13.5629 5.46428 13.6798 5.41188C13.7967 5.35947 13.9224 5.33188 14.0497 5.33073C14.1769 5.32957 14.3031 5.35487 14.4209 5.40516C14.5387 5.45544 14.6457 5.52969 14.7357 5.62358C14.8256 5.71747 14.8968 5.82913 14.945 5.95202C14.9932 6.07492 15.0174 6.2066 15.0163 6.33938C15.0152 6.47216 14.9888 6.60338 14.9386 6.72538C14.8883 6.84739 14.8153 6.95773 14.7238 7.04998L9.98004 12L14.7238 16.95C14.8984 17.1386 14.995 17.3912 14.9928 17.6534C14.9906 17.9156 14.8898 18.1664 14.7121 18.3518C14.5344 18.5372 14.2941 18.6424 14.0428 18.6447C13.7915 18.6469 13.5494 18.5461 13.3687 18.364L7.94741 12.707Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sr-only">Previous</span>
          </button>

          <button
            type="button"
            className="banner-slider__nav banner-slider__nav--next"
            onClick={goNext}
            aria-label="Next slide"
            disabled={slides.length < 2}
          >
            <span className="banner-slider__navIcon" aria-hidden="true">
              <svg viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0526 11.293C15.2322 11.4806 15.3332 11.7349 15.3332 12C15.3332 12.2652 15.2322 12.5195 15.0526 12.707L9.63129 18.364C9.54289 18.4595 9.43714 18.5357 9.32022 18.5881C9.2033 18.6405 9.07755 18.6681 8.9503 18.6693C8.82306 18.6704 8.69686 18.6451 8.57909 18.5948C8.46131 18.5446 8.35431 18.4703 8.26433 18.3764C8.17435 18.2825 8.10319 18.1709 8.05501 18.048C8.00682 17.9251 7.98257 17.7934 7.98368 17.6606C7.98478 17.5278 8.01122 17.3966 8.06145 17.2746C8.11167 17.1526 8.18468 17.0423 8.27621 16.95L13.02 12L8.27621 7.05002C8.10164 6.86142 8.00505 6.60882 8.00723 6.34662C8.00941 6.08442 8.1102 5.83361 8.28788 5.6482C8.46557 5.4628 8.70593 5.35763 8.9572 5.35535C9.20847 5.35307 9.45055 5.45386 9.63129 5.63602L15.0526 11.293Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sr-only">Next</span>
          </button>

          <Slider ref={sliderRef} {...settings} className="banner-slider-container">
            {slides.map((banner, index) => {
              const title = normalizeText(banner.title) || `Banner ${index + 1}`;
              const link = normalizeText(banner.link);
              const imageSrc = resolveImage(banner.image);
              const SlideTag = link ? 'a' : 'div';
              const slideProps = link
                ? {
                  href: link,
                  target: isExternalLink(link) ? '_blank' : undefined,
                  rel: isExternalLink(link) ? 'noreferrer noopener' : undefined,
                }
                : {};

              return (
                <div key={banner.id ?? index} className="banner-slide focus:outline-none">
                  <SlideTag className="banner-slide__card" {...slideProps}>
                    <div className="banner-slide__imageWrap">
                      <img
                        src={imageSrc}
                        alt={title}
                        className="banner-slide__image"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1400px"
                      />

                      <div className="banner-slide__shine" aria-hidden="true" />
                    </div>
                  </SlideTag>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>

      <style>{`
        .banner-slider-shell {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
}

        ..banner-slider-stage {
  position: relative;
  padding: 0;
}

        .banner-slider-backdrop {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background:
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.26) 40%, rgba(255, 255, 255, 0.08) 63%, rgba(255, 255, 255, 0) 100%),
            linear-gradient(145deg, rgba(15, 23, 42, 0.18), rgba(37, 99, 235, 0.14));
          background-size: cover;
          background-position: center;
          filter: blur(24px);
          transform: scale(0.96);
          opacity: 0.95;
          pointer-events: none;
        }

        .banner-slider-viewport {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 18px;
  background: transparent;
  border: none;
  box-shadow: none;
}
.banner-slider-container,
.banner-slider-container .slick-list,
.banner-slider-container .slick-track,
.banner-slider-container .slick-slide,
.banner-slider-container .slick-slide > div {
    height: 100%;
}

.banner-slider-container .slick-track {
    display: flex;
}

.banner-slider-container .slick-slide {
    display: flex;
}

.banner-slider-container .slick-slide > div {
    width: 100%;
}

        .banner-slide {
          height: 100%;
          outline: none;
        }

        .banner-slide__card {
    display: block;
    position: relative;
    width: 100%;
    height: clamp(220px, 28vw, 420px);
    overflow: hidden;
    line-height: 0;
}

        .banner-slide__imageWrap {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .banner-slide__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

        .banner-slide__shine {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.54), rgba(255, 255, 255, 0) 32%),
            linear-gradient(180deg, rgba(15, 23, 42, 0) 46%, rgba(15, 23, 42, 0.14));
          pointer-events: none;
        }

        .banner-slider__indicators {
          position: absolute;
          top: 18px;
          left: 50%;
          z-index: 4;
          transform: translateX(-50%);
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.54);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(14px);
        }

        .banner-slider__indicators ul {
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0;
          padding: 0;
        }

        .banner-slider__indicators li {
          width: auto;
          height: auto;
          margin: 0;
        }

        .banner-slider__indicators li button {
          width: auto;
          height: auto;
          padding: 0;
        }

        .banner-slider__indicators li button:before {
          display: none;
          content: none;
        }

        .banner-slider-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.18);
          color: transparent;
          cursor: pointer;
          transition: width 220ms ease, background-color 220ms ease, transform 220ms ease;
        }

        .banner-slider__indicators li.slick-active .banner-slider-dot {
          width: 26px;
          background: #0f172a;
        }

        .banner-slider__nav {
          position: absolute;
          top: 50%;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          margin-top: -28px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18);
          transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        }

        .banner-slider__nav:hover {
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 22px 40px rgba(15, 23, 42, 0.22);
        }

        .banner-slider__nav:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .banner-slider__nav--prev {
          left: 25px;
        }

        .banner-slider__nav--next {
          right: 25px;
        }

        .banner-slider__navIcon {
          width: 24px;
          height: 24px;
        }

        .banner-slider__navIcon svg {
          width: 100%;
          height: 100%;
        }

        @media (min-width: 1024px) {
          .banner-slider-stage {
            padding: 22px 22px 10px;
          }

          .banner-slide__card {
            height: 420px;
          }
        }

        @media (max-width: 768px) {
          .banner-slider-shell {
            padding: 0px 0 10px;
          }

          .banner-slider-stage {
            padding: 0px 10px 0px;
          }

          .banner-slider-viewport {
            border-radius: 16px;
          }

          .banner-slide__card {
            height: 180px;
          }

          .banner-slider__nav {
            width: 46px;
            height: 46px;
            margin-top: -23px;
          }

          .banner-slider__indicators {
            top: 12px;
            padding: 10px 12px;
            gap: 8px;
          }
        }



          @media (max-width: 576px) {
         .banner-slider__nav {
         
          width: 22px;
          height: 22px;
         margin-top: -13px;
        }
         .banner-slider__nav--prev {
          left: 10px;
        }

        .banner-slider__nav--next {
          right: 10px;
        }
          .banner-slide__card {
            height: 140px;
          }
      }
      `}</style>
    </section>
  );
};

export default BannerSlider;


