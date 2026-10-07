import axios from "axios";
import { config } from "../config";

const STORAGE_KEY = "site-settings";
const UPDATE_EVENT = "site-settings-updated";
const SITE_SETTINGS_ENDPOINT = `${config.apiUrl}/site-settings`;

const EMPTY_SETTINGS = {
  header_script: "",
  footer_script: "",
};

export const normalizeSiteSettings = (payload) => {
  const data = payload?.data ?? payload ?? {};

  return {
    header_script:
      data.header_script ??
      data.headerCode ??
      data.header_code ??
      EMPTY_SETTINGS.header_script,
    footer_script:
      data.footer_script ??
      data.footerCode ??
      data.footer_code ??
      EMPTY_SETTINGS.footer_script,
  };
};

export const getStoredSiteSettings = () => {
  try {
    const rawSettings = window.localStorage.getItem(STORAGE_KEY);

    if (!rawSettings) {
      return { ...EMPTY_SETTINGS };
    }

    return normalizeSiteSettings(JSON.parse(rawSettings));
  } catch (error) {
    console.error("Failed to read site settings from localStorage:", error);
    return { ...EMPTY_SETTINGS };
  }
};

export const cacheSiteSettings = (settings) => {
  const normalized = normalizeSiteSettings(settings);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const emitSiteSettingsUpdate = (settings) => {
  const normalized = normalizeSiteSettings(settings);

  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, {
      detail: normalized,
    })
  );
};

export const getSiteSettings = async () => {
  try {
    const response = await axios.get(SITE_SETTINGS_ENDPOINT, {
      withCredentials: true,
    });
    const normalized = cacheSiteSettings(response.data);

    return {
      settings: normalized,
      source: "api",
      fallback: false,
    };
  } catch (error) {
    console.warn("Using localStorage fallback for site settings:", error);

    return {
      settings: getStoredSiteSettings(),
      source: "localStorage",
      fallback: true,
    };
  }
};

export const saveSiteSettings = async (settings) => {
  const normalized = normalizeSiteSettings(settings);

  try {
    const response = await axios.post(SITE_SETTINGS_ENDPOINT, normalized, {
      withCredentials: true,
    });
    const saved = cacheSiteSettings(response.data);
    emitSiteSettingsUpdate(saved);

    return {
      settings: saved,
      source: "api",
      fallback: false,
    };
  } catch (error) {
    console.warn("API save failed, persisting site settings to localStorage:", error);

    const saved = cacheSiteSettings(normalized);
    emitSiteSettingsUpdate(saved);

    return {
      settings: saved,
      source: "localStorage",
      fallback: true,
    };
  }
};

export const subscribeToSiteSettings = (callback) => {
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getStoredSiteSettings());
    }
  };

  const handleCustomUpdate = (event) => {
    callback(normalizeSiteSettings(event.detail));
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(UPDATE_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(UPDATE_EVENT, handleCustomUpdate);
  };
};
