import React from 'react';
import { FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { buildImageUrl, handleImageFallback } from '../utils/image';
import { saveProductAnchor } from '../utils/scrollRestoration';

const ProductCard = ({
  product,
  scrollKey = '/',
  imageUrl = config.imageUrl,
  isAdded = false,
  isQuantitySelectorOpen = false,
  quantity = 1,
  onAddClick,
  onQuantityChange,
  onConfirmAddToCart,
  onCancelQuantity,
  addLabel = 'ADD',
  addedLabel = 'ADDED',
  confirmLabel = 'OK',
}) => {
  if (!product) {
    return null;
  }

  const price = Number(product.discount_price || product.price || 0);
  const originalPrice = Number(product.price || 0);
  const discountPercentage =
    product.discount_price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const productImage = buildImageUrl(
    imageUrl,
    product?.images?.[0]?.image || product?.image || product?.product_image
  );

  const handleCardAction = (event, callback, ...args) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof callback === 'function') {
      callback(event, ...args);
    }
  };

  return (
    <article className="group overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/${product.slug}`}
        onClick={() => saveProductAnchor(product.slug, scrollKey)}
        data-product-scroll-key={scrollKey}
        data-product-slug={product.slug}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-50">
          {discountPercentage > 0 && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {discountPercentage}% OFF
            </span>
          )}

          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageFallback}
          />
        </div>

        <div className="flex flex-col p-2 md:p-3">
          <h3 className="min-h-[36px] text-center text-xs font-medium leading-tight text-gray-800 line-clamp-2 md:text-sm">
            {product.name}
          </h3>

          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {product.discount_price ? (
                <>
                  <p className="text-[10px] leading-none text-gray-400 line-through">
                    ৳{originalPrice.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-tight text-green-600 md:text-base">
                    ৳{price.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold leading-tight text-green-600 md:text-base">
                  ৳{price.toFixed(2)}
                </p>
              )}
            </div>

            <div
              className="relative z-20"
              onClick={(event) => event.stopPropagation()}
            >
              {isQuantitySelectorOpen ? (
                <div className="absolute bottom-full right-0 mb-2 flex min-w-max items-center gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={(event) =>
                      handleCardAction(event, onQuantityChange, product.id, quantity - 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-[10px] hover:bg-gray-200"
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="text-[9px]" />
                  </button>

                  <span className="w-6 text-center text-[11px] font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={(event) =>
                      handleCardAction(event, onQuantityChange, product.id, quantity + 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-[10px] hover:bg-gray-200"
                  >
                    <FaPlus className="text-[9px]" />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => handleCardAction(event, onConfirmAddToCart, product)}
                    className="rounded-md bg-green-500 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    {confirmLabel}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => handleCardAction(event, onCancelQuantity, product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white transition-colors hover:bg-red-600"
                  >
                    <FaTimes className="text-[9px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(event) => handleCardAction(event, onAddClick, product)}
                  className={`product-add-button ${isAdded ? 'is-added' : ''}`}
                >
                  <span className="w-full text-left text-xs md:text-sm">
                    {isAdded ? addedLabel : addLabel}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
