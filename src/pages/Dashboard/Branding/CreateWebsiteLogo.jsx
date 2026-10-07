import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { useNavigate } from "react-router-dom";

const apiUrl = config.apiUrl;

const CreateWebsiteLogo = ({onLogoCreated}) => {
  const [formData, setFormData] = useState({ 
    image: null, 
    brand_slogan: "",
    previewUrl: null
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          [name]: files[0],
          previewUrl: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
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
    data.append("image", formData.image);
    data.append("brand_slogan", formData.brand_slogan);

    try {
      await axios.post(`${apiUrl}/websitelogos`, data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Logo created successfully!");
      onLogoCreated()
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "An error occurred while creating the logo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Logo</h2>
          <button
            onClick={() => navigate("/admin/website-logos")}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Slogan*
              </label>
              <input
                type="text"
                name="brand_slogan"
                value={formData.brand_slogan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your brand slogan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Image*
              </label>
              <div className="flex flex-col items-center">
                {formData.previewUrl ? (
                  <div className="mb-4 w-full">
                    <div className="relative">
                      <img 
                        src={formData.previewUrl} 
                        alt="Preview" 
                        className="h-40 w-full object-contain border-2 border-gray-300 rounded-lg"
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
                    <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, or JPEG (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({ image: null, brand_slogan: "", previewUrl: null });
                setError(null);
              }}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={isSubmitting}
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
                "Create Logo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWebsiteLogo;