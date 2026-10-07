import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const MINI_CART_ICON_URL =
  'https://d2t8nl1y0ie1km.cloudfront.net/public/minicart-icon.svg';

const getItemQuantity = (item) => {
  if (!item) return 1;
  if (item.type === 'lab_test') {
    return item.quantity || item.patientCount || 1;
  }
  return item.quantity || 1;
};

const getItemTotal = (item) => {
  if (!item) return 0;
  return Number(item.price || 0) * getItemQuantity(item);
};

const CartTriggerButton = ({ items = [], onClick }) => {
  const itemCount = items.reduce((total, item) => total + getItemQuantity(item), 0);
  const totalAmount = items.reduce((total, item) => total + getItemTotal(item), 0);

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="fixed right-3.5 top-1/2 z-40 hidden -translate-y-1/2 text-xs font-medium leading-none text-white transition-all duration-300 ease-linear before:absolute before:left-[2px] before:top-[-4px] before:block before:h-[calc(100%+5px)] before:w-full before:rounded-[4px] before:bg-[#facc15] before:content-[''] md:block"
        aria-label="View cart"
      >
        <span
          className="relative block rounded-t-[5px] bg-green-600 bg-no-repeat px-3 pb-1.5 pt-6 text-center shadow-[0_12px_24px_rgba(22,163,74,0.18)]"
          style={{
            backgroundImage: `url('${MINI_CART_ICON_URL}')`,
            backgroundPosition: 'center 6px',
            backgroundSize: '24px auto',
          }}
        >
          {itemCount} items
        </span>
        <span className="relative block rounded-b-[5px] bg-black px-3 py-1.5 text-center">
          ৳{Math.round(totalAmount)}
        </span>
      </button>

      <button
        type="button"
        onClick={onClick}
        className="fixed right-3 bottom-3 z-30 flex items-center justify-center rounded-full bg-green-600 p-2.5 text-white shadow-lg transition-colors hover:bg-green-700 md:hidden"
        aria-label="View cart"
      >
        <FaShoppingCart className="text-base" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </button>
    </>
  );
};

export default CartTriggerButton;
