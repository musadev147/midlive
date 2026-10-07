import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateBanner from "./UpdateBanner";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({ 
    title: "",
    description: "",
    image: null,
    link: "",
    is_active: true,
    sort_order: 0
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  console.log("ViewBanner component rendered", banners);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${apiUrl}/banners`);
        setBanners(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching banners:", err.response?.data || err.message);
        setError("Failed to load banners. Please try again.");
        setLoading(false);
      }
    };
    fetchBanners();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await axios.delete(`${apiUrl}/bannerdelete/${id}`);
        setBanners(prev => prev.filter(banner => banner.id !== id));
      } catch (err) {
        console.error("Error deleting banner:", err.response?.data || err.message);
        setError("Failed to delete banner. Please try again.");
      }
    }
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner.id);
    setFormData({ 
      title: banner.title,
      description: banner.description,
      link: banner.link,
      is_active: banner.is_active,
      sort_order: banner.sort_order,
      image: banner.image
    });
    setPreviewUrl(`${banner.image}`);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } 
    else if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      };
      reader.readAsDataURL(files[0]);
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  console.log("Form data:", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image", formData.image);
      }
      data.append("link", formData.link);
      data.append("is_active", formData.is_active ? "1" : "0");
      data.append("sort_order", formData.sort_order);

      await axios.post(`${apiUrl}/bannersupdate/${editingBanner}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setRefreshKey(prev => prev + 1);
      setEditingBanner(null);
    } catch (err) {
      console.error("Error updating banner:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editingBanner) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Banner Sliders</h2>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {banner.title || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={banner.image} 
                      className="h-16 w-auto object-cover" 
                      alt="Banner" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {banner.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditClick(banner)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingBanner && (
        <UpdateBanner
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingBanner={setEditingBanner}
          previewUrl={previewUrl}
        />
      )}
    </div>
  );
};

export default ViewBanner;