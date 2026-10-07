export const DEFAULT_IMAGE_FALLBACK = "/medivila-default.jpg";

export const buildImageUrl = (baseUrl, value) => {
  if (!value || typeof value !== "string") return DEFAULT_IMAGE_FALLBACK;

  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_IMAGE_FALLBACK;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const normalizedBase = (baseUrl || "").replace(/\/+$/, "");
  const normalizedPath = trimmed.replace(/^\/+/, "");

  if (!normalizedBase) return DEFAULT_IMAGE_FALLBACK;
  return `${normalizedBase}/${normalizedPath}`;
};

export const handleImageFallback = (event) => {
  const target = event?.currentTarget;
  if (!target || target.dataset?.fallbackApplied === "true") return;
  target.dataset.fallbackApplied = "true";
  target.src = DEFAULT_IMAGE_FALLBACK;
};
