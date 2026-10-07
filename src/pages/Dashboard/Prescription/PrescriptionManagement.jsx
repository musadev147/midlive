import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaEye,
  FaDownload,
  FaTrash,
  FaFilePdf,
  FaImage,
  FaUser,
  FaPhone,
  FaStickyNote,
  FaTimes,
} from "react-icons/fa";
import { config } from "../../../config";

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const API_URL = `${config.apiUrl}/prescriptions`;

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setPrescriptions(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      alert("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this prescription?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Prescription deleted successfully");
      fetchPrescriptions();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert("Failed to delete prescription");
    }
  };

  const getFileUrl = (item) => {
    if (item.file_url) return item.file_url;
    if (item.file) return `${config.apiUrl.replace("/api", "")}/storage/${item.file}`;
    return "";
  };

  const getFileExtension = (url = "") => {
    return url.split(".").pop()?.toLowerCase();
  };

  const isImageFile = (url = "") => {
    const ext = getFileExtension(url);
    return ["jpg", "jpeg", "png", "webp"].includes(ext);
  };

  const isPdfFile = (url = "") => {
    const ext = getFileExtension(url);
    return ext === "pdf";
  };

  const handleDownload = async (url, filename = "prescription-file") => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            Prescription Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            View, preview, download and manage uploaded prescriptions.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <p className="text-lg font-semibold text-gray-700">No prescriptions found</p>
            <p className="mt-2 text-sm text-gray-500">Uploaded prescriptions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {prescriptions.map((item) => {
              const fileUrl = getFileUrl(item);

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Top */}
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">Prescription #{item.id}</h2>
                      <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                        {isPdfFile(fileUrl) ? "PDF" : isImageFile(fileUrl) ? "Image" : "File"}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 p-5">
                    <div className="flex items-start gap-3">
                      <FaUser className="mt-1 text-green-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">{item.name || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaPhone className="mt-1 text-blue-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">{item.phone || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaStickyNote className="mt-1 text-violet-600" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Notes</p>
                        <p className="font-medium text-gray-800">
                          {item.notes ? item.notes : "No notes provided"}
                        </p>
                      </div>
                    </div>

                    {/* File Preview Thumbnail */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      {isImageFile(fileUrl) ? (
                        <div className="overflow-hidden rounded-xl">
                          <img
                            src={fileUrl}
                            alt="Prescription"
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      ) : isPdfFile(fileUrl) ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-red-50 text-center">
                          <FaFilePdf className="mb-3 text-5xl text-red-500" />
                          <p className="text-sm font-semibold text-red-600">PDF Prescription</p>
                          <p className="mt-1 text-xs text-gray-500">Click view to preview PDF</p>
                        </div>
                      ) : (
                        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-gray-100 text-center">
                          <FaImage className="mb-3 text-5xl text-gray-400" />
                          <p className="text-sm text-gray-500">Preview not available</p>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-500">
                      Uploaded:{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "N/A"}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setPreviewItem({ ...item, fileUrl })}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                      >
                        <FaEye />
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(
                            fileUrl,
                            `prescription-${item.id}.${getFileExtension(fileUrl) || "file"}`
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                      >
                        <FaDownload />
                        Download
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Prescription Preview
                  </h3>
                  <p className="text-sm text-gray-500">
                    {previewItem.name} - {previewItem.phone}
                  </p>
                </div>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="max-h-[80vh] overflow-y-auto p-5">
                {isImageFile(previewItem.fileUrl) ? (
                  <img
                    src={previewItem.fileUrl}
                    alt="Prescription Preview"
                    className="mx-auto max-h-[70vh] rounded-xl object-contain"
                  />
                ) : isPdfFile(previewItem.fileUrl) ? (
                  <iframe
                    src={previewItem.fileUrl}
                    title="Prescription PDF"
                    className="h-[70vh] w-full rounded-xl border"
                  />
                ) : (
                  <div className="py-16 text-center text-gray-500">
                    Preview not supported for this file type.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
                <button
                  onClick={() =>
                    handleDownload(
                      previewItem.fileUrl,
                      `prescription-${previewItem.id}.${getFileExtension(previewItem.fileUrl) || "file"}`
                    )
                  }
                  className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-white transition hover:bg-green-600"
                >
                  Download
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="rounded-xl bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionManagement;