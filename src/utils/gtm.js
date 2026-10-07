/**
 * Google Tag Manager (GTM) GA4 Ecommerce Tracking Utility
 */

export const pushToDataLayer = (data) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object
    window.dataLayer.push(data);
  }
};

export const gtmPageView = (url) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_url: url,
    });
  }
};

export const gtmViewItem = (product) => {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'BDT',
      value: Number(product.discount_price || product.price || 0),
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          price: Number(product.discount_price || product.price || 0),
          quantity: 1,
        },
      ],
    },
  });
};

export const gtmAddToCart = (item, quantity = 1) => {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'BDT',
      value: Number(item.price || 0) * quantity,
      items: [
        {
          item_id: String(item.product_id || item.id),
          item_name: item.name,
          price: Number(item.price || 0),
          quantity: quantity,
          item_variant: item.color || item.size || undefined,
        },
      ],
    },
  });
};

export const gtmBeginCheckout = (items, totalValue) => {
  const formattedItems = items.map((item) => ({
    item_id: String(item.product_id || item.id),
    item_name: item.name || item.lab_test_name,
    price: Number(item.price || 0),
    quantity: item.quantity || item.patientCount || 1,
    item_variant: item.color || item.size || undefined,
  }));

  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BDT',
      value: Number(totalValue || 0),
      items: formattedItems,
    },
  });
};

export const gtmPurchase = (orderDetails, items) => {
  const formattedItems = items.map((item) => ({
    item_id: String(item.product_id || item.id || item.lab_test_id),
    item_name: item.product_name || item.lab_test_name,
    price: Number(item.price || item.total_price || 0),
    quantity: item.quantity || item.patient_count || 1,
    item_variant: item.color || item.size || undefined,
  }));

  const formatPhoneForGA4 = (phoneNumber) => {
    if (!phoneNumber) return '';
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length === 11 && !digitsOnly.startsWith('880')) {
      return `+880${digitsOnly.substring(1)}`;
    }
    if (digitsOnly.startsWith('880')) {
      return `+${digitsOnly}`;
    }
    return `+88${digitsOnly}`;
  };

  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderDetails.order_id,
      value: Number(orderDetails.total || 0),
      currency: 'BDT',
      shipping: Number(orderDetails.delivery_charge || 0),
      items: formattedItems,
    },
    user_data: {
      email_address: orderDetails.email || '',
      phone_number: formatPhoneForGA4(orderDetails.phone_number),
      address: {
        first_name: orderDetails.customer_name || '',
        street: orderDetails.customer_address || '',
        city: orderDetails.city || orderDetails.customer_address?.split(',')?.find(s => s.toLowerCase().includes('district'))?.replace(/district:/i, '')?.trim() || '',
        country: 'BD'
      }
    }
  });
};
