import React, { useState } from "react";
import axios from "axios";
import {
  X,
  FileText,
  User,
  Phone,
  StickyNote,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { config } from "../config"; // path আপনার project অনুযায়ী ঠিক করবেন

const UploadPrescriptionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      notes: "",
      file: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert("Please select a prescription file.");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("notes", formData.notes || "");
      payload.append("file", formData.file);

      const response = await axios.post(
        `${config.apiUrl}/prescriptions`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload response:", response.data);
      alert("Prescription uploaded successfully!");

      resetForm();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        alert(firstError || "Failed to upload prescription");
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to upload prescription");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[430px] max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between rounded-t-2xl bg-gradient-to-r from-green-500 to-blue-500 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-none md:text-[28px]">
                Upload Prescription
              </h2>
              <p className="mt-1 text-sm text-white/90">
                Get your medicine delivered
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Name */}
          <div>
            <label className="mb-2 flex items-center text-sm font-semibold text-gray-800">
              <User size={16} className="mr-2 text-green-600" />
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 flex items-center text-sm font-semibold text-gray-800">
              <Phone size={16} className="mr-2 text-blue-600" />
              Mobile Number *
            </label>
            <input
              type="text"
              name="phone"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 flex items-center text-sm font-semibold text-gray-800">
              <StickyNote size={16} className="mr-2 text-violet-600" />
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows="4"
              placeholder="Any special instructions or notes..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 flex items-center text-sm font-semibold text-gray-800">
              <Upload size={16} className="mr-2 text-red-500" />
              Prescription File *
            </label>

            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-green-400 hover:bg-green-50">
              <input
                type="file"
                name="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleChange}
                required
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Upload size={22} className="text-green-600" />
                </div>

                <p className="text-base font-medium text-gray-700">
                  {formData.file
                    ? formData.file.name
                    : "Click to upload prescription"}
                </p>
                <span className="mt-1 text-sm text-gray-500">
                  Supports: JPG, PNG, PDF (Max 2MB)
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 text-base font-bold text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Uploading..." : "Upload Prescription"}
          </button>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center text-sm font-bold text-blue-700">
              <AlertTriangle size={18} className="mr-2" />
              Important Information
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-blue-700">
              <li>Our pharmacist will verify your prescription</li>
              <li>We&apos;ll contact you within 30 minutes</li>
              <li>Prescription medicines require valid doctor prescription</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPrescriptionModal;