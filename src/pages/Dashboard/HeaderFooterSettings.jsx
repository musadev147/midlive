import React, { useEffect, useState } from "react";
import {
  getSiteSettings,
  normalizeSiteSettings,
  saveSiteSettings,
} from "../../utils/siteSettings";

const HeaderFooterSettings = () => {
  const [formData, setFormData] = useState({
    header_script: "",
    footer_script: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storageSource, setStorageSource] = useState("api");
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      setLoading(true);

      try {
        const { settings, source, fallback } = await getSiteSettings();

        if (!isMounted) {
          return;
        }

        setFormData(normalizeSiteSettings(settings));
        setStorageSource(source);
        setIsFallbackMode(fallback);

        if (fallback) {
          setFeedback({
            type: "error",
            text: "Backend API is unavailable right now. Showing the last cached script settings.",
          });
        }
      } catch (error) {
        if (isMounted) {
          setFeedback({
            type: "error",
            text: "Unable to load the current script settings.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({
      type: "",
      text: "",
    });

    try {
      const { settings, source, fallback } = await saveSiteSettings(formData);

      setFormData(normalizeSiteSettings(settings));
      setStorageSource(source);
      setIsFallbackMode(fallback);
      setFeedback({
        type: fallback ? "error" : "success",
        text:
          fallback
            ? "Backend API could not be reached. Scripts were saved only in local cache."
            : "Custom scripts saved successfully to the backend API.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: "Saving failed. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 text-sm text-gray-500">Loading script settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Header and Footer Scripts
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage custom raw HTML and script snippets for site-wide injection.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Active source:{" "}
          <span className="font-semibold">
            {storageSource === "api" ? "medical-backend API" : "local cache"}
          </span>
          {isFallbackMode ? " (fallback mode)" : ""}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="header_script"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Header Code
          </label>
          <p className="mb-3 text-sm text-gray-500">
            Injected into the document head for tags, metadata, analytics, or
            custom scripts.
          </p>
          <textarea
            id="header_script"
            name="header_script"
            value={formData.header_script}
            onChange={handleChange}
            rows={10}
            spellCheck="false"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            placeholder={`<script>\n  console.log("Header code loaded");\n</script>`}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="footer_script"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Footer Code
          </label>
          <p className="mb-3 text-sm text-gray-500">
            Injected just before the closing body tag for widgets or deferred
            scripts.
          </p>
          <textarea
            id="footer_script"
            name="footer_script"
            value={formData.footer_script}
            onChange={handleChange}
            rows={10}
            spellCheck="false"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            placeholder={`<script>\n  console.log("Footer code loaded");\n</script>`}
          />
        </div>

        {feedback.text ? (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving ? "Saving..." : "Save Scripts"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeaderFooterSettings;
