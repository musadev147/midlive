import * as React from 'react';

const DEFAULT_SCROLL_KEY = 'medivila:last-scroll-y';
const DEFAULT_PRODUCT_KEY = 'medivila:last-product-anchor';

const getSafeSelector = (value) => {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, '\\$&');
};

const parseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

export const saveScrollPosition = (key = DEFAULT_SCROLL_KEY) => {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(key, String(window.scrollY || 0));
};

export const saveProductAnchor = (slug, key = DEFAULT_PRODUCT_KEY) => {
  if (typeof window === 'undefined' || !slug) return;

  sessionStorage.setItem(
    key,
    JSON.stringify({
      slug: String(slug),
      y: window.scrollY || 0,
    })
  );
};

export const restoreProductAnchor = (
  key = DEFAULT_PRODUCT_KEY,
  { offset = 120, maxAttempts = 60 } = {}
) => {
  if (typeof window === 'undefined') return;

  const savedValue = sessionStorage.getItem(key);
  if (savedValue === null) return;

  const payload = parseJson(savedValue);
  if (!payload?.slug) {
    sessionStorage.removeItem(key);
    return;
  }

  let attempts = 0;
  let rafId = null;

  const fallbackScroll = () => {
    const y = Number(payload.y);
    window.scrollTo({
      top: Number.isFinite(y) ? y : 0,
      left: 0,
      behavior: 'auto',
    });
    sessionStorage.removeItem(key);
  };

  const tryRestore = () => {
    const selector = `[data-product-scroll-key="${getSafeSelector(
      key
    )}"][data-product-slug="${getSafeSelector(payload.slug)}"]`;
    const target = document.querySelector(selector);

    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });

      if (offset) {
        window.scrollBy({ top: -offset, left: 0, behavior: 'auto' });
      }

      sessionStorage.removeItem(key);
      return;
    }

    attempts += 1;
    if (attempts >= maxAttempts) {
      fallbackScroll();
      return;
    }

    rafId = window.requestAnimationFrame(tryRestore);
  };

  rafId = window.requestAnimationFrame(() => {
    rafId = window.requestAnimationFrame(tryRestore);
  });

  return () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
  };
};

export const useProductScrollRestoration = (
  key = DEFAULT_PRODUCT_KEY,
  enabled = true,
  deps = [],
  options = {}
) => {
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    restoredRef.current = false;
  }, [key, ...deps]);

  React.useEffect(() => {
    if (!enabled || restoredRef.current) return undefined;

    const savedValue = sessionStorage.getItem(key);
    if (savedValue === null) return undefined;

    const restore = restoreProductAnchor(key, options);
    restoredRef.current = true;

    return restore;
  }, [enabled, key, ...deps]);
};
