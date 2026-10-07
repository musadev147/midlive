import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';

const apiUrl = config.apiUrl;

const CreateBanner = ({ onBannerCreated }) => {
  const [formData, setFormData] = useState({ 
    title: "",
    description: "",
    image: null,
    link: "",
    is_active: true,
    sort_order: 0,
    previewUrl: null
  });
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    setError(null);

    try {
       const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.9,
          fileType: 'image/webp'
      };

      const compressedBlob = await imageCompression(file, options);
      
      const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      const compressedFile = new File([compressedBlob], fileName, {
        type: "image/webp",
        lastModified: Date.now()
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);

      setFormData(prev => ({ 
        ...prev, 
        image: compressedFile,
        previewUrl: previewUrl
      }));

    } catch (error) {
      console.error('Error compressing image:', error);
      setError("Failed to process image. Please try another image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.image) {
      setError("Please select an image to upload");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);
    data.append("link", formData.link);
    data.append("is_active", formData.is_active ? "1" : "0");
    data.append("sort_order", formData.sort_order);

    try {
      await axios.post(`${apiUrl}/banners`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Banner created successfully!");
      onBannerCreated();
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "An error occurred while creating the banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Banner</h2>
          <button
            onClick={() => navigate("/admin/banner-sliders")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to List
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image*
              </label>
              <div className="flex flex-col items-center">
                {formData.previewUrl ? (
                  <div className="mb-4 w-full">
                    <div className="relative">
                      <img 
                        src={formData.previewUrl} 
                        alt="Preview" 
                        className="h-64 w-full object-cover border-2 border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: null, previewUrl: null }))}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full">
                    <div className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg ${isCompressing ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'} cursor-pointer`}>
                      {isCompressing ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Compressing image...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG (Max 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      required
                      disabled={isCompressing}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter banner description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                id="is_active"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ 
                  title: "",
                  description: "",
                  image: null,
                  link: "",
                  is_active: true,
                  sort_order: 0,
                  previewUrl: null
                });
                setError(null);
              }}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting || isCompressing}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={isSubmitting || isCompressing}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Banner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBanner;