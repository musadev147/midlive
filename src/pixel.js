let pixelsInitialized = [];
let isInitializing = false;

// একাধিক পিক্সেল ইনিশিয়ালাইজ করার ফাংশন
export const initFacebookPixels = (pixelIds) => {
  if (typeof window === 'undefined' || !Array.isArray(pixelIds)) return;
  if (isInitializing) return;
  isInitializing = true;

  // নতুন পিক্সেলগুলো ফিল্টার করুন যেগুলো এখনো ইনিশিয়ালাইজ হয়নি
  const newPixelIds = pixelIds.filter(id => !pixelsInitialized.includes(id));
  
  if (newPixelIds.length === 0) {
    isInitializing = false;
    return;
  }
 

  if (!window.fbq) {
    window.fbq = function () {
      window.fbq.callMethod ?
        window.fbq.callMethod.apply(window.fbq, arguments) :
        window.fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  // প্রতিটি নতুন পিক্সেল ইনিশিয়ালাইজ করুন
  newPixelIds.forEach(pixelId => {
    window.fbq('init', pixelId);
    window.fbq('trackSingle', pixelId, 'PageView');
    pixelsInitialized.push(pixelId);
  });

  isInitializing = false;
};

// একাধিক পিক্সেলে ইভেন্ট ট্র্যাক করার ফাংশন
export const trackEventOnMultiplePixels = (pixelIds, eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.fbq && Array.isArray(pixelIds)) {
    const { event_id, ...rest } = eventParams;
    
    pixelIds.forEach(pixelId => {
      if (pixelsInitialized.includes(pixelId)) {
        window.fbq('trackSingle', pixelId, eventName, {
          ...rest,
          eventID: event_id,
        });
      }
    });
  }
};