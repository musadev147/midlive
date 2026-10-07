const OFFER_ACCENT_RULES = [
  { keywords: ['whatsapp', 'green', 'emerald'], color: '#5CD163' },
  { keywords: ['prescription', 'upload', 'cyan', 'teal'], color: '#10ADBE' },
  { keywords: ['pharmacy', 'lime', 'chartreuse'], color: '#7EB900' },
  { keywords: ['healthcare', 'health care', 'purple', 'violet', 'indigo', 'pink'], color: '#B094FF' },
  { keywords: ['call', 'order', 'orange', 'amber', 'peach'], color: '#FE964A' },
  { keywords: ['lab', 'test', 'red', 'rose'], color: '#FD6A6A' },
  { keywords: ['blue'], color: '#6C8CFF' },
];

const OFFER_FALLBACK_PALETTE = ['#5CD163', '#10ADBE', '#7EB900', '#B094FF', '#FE964A', '#FD6A6A'];

const DEFAULT_ACCENT = '#5CD163';

const normalize = (value) => String(value || '').toLowerCase();

export const resolveOfferAccent = (offer = {}, index = 0) => {
  const directColor = String(offer.card_color || '').trim();
  if (directColor) return directColor;

  const source = normalize(
    [
      offer.title,
      offer.top_text,
      offer.discount,
      offer.main_text,
      offer.button_text,
      offer.subtext,
      offer.support_text,
      offer.gradient,
      offer.button_gradient,
      offer.icon_bg,
      offer.icon_color,
    ]
      .filter(Boolean)
      .join(' ')
  );

  const match = OFFER_ACCENT_RULES.find(({ keywords }) =>
    keywords.some((keyword) => source.includes(keyword))
  );

  return match?.color || OFFER_FALLBACK_PALETTE[index % OFFER_FALLBACK_PALETTE.length] || DEFAULT_ACCENT;
};

export const buildOfferCardStyle = (offer = {}, index = 0) => ({
  backgroundImage: `linear-gradient(151.46deg, #fffef9 3.3%, ${resolveOfferAccent(offer, index)} 93.34%)`,
});

export const buildOfferCircleStyle = (offer = {}, index = 0) => ({
  backgroundColor: resolveOfferAccent(offer, index),
  color: '#ffffff',
});

export const buildOfferButtonStyle = (offer = {}, index = 0) => ({
  color: resolveOfferAccent(offer, index),
});

export const sortOffers = (offers = []) =>
  [...offers].sort((left, right) => {
    const leftOrder = Number(left?.sort_order ?? 9999);
    const rightOrder = Number(right?.sort_order ?? 9999);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return Number(left?.id ?? 0) - Number(right?.id ?? 0);
  });
