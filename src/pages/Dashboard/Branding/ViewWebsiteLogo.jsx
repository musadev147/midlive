// ViewWebsiteLogo.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateWebsiteLogo from "./UpdateWebsiteLogo";

const apiUrl = config.apiUrl;

const ViewWebsiteLogo = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLogo, setEditingLogo] = useState(null);
  const [formData, setFormData] = useState({ 
    image: null, 
    brand_slogan: "" 
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/websitelogos`);
        setLogos(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching logos:", err.response?.data || err.message);
        setError("Failed to load logos. Please try again.");
        setLoading(false);
      }
    };
    fetchLogos();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this logo?")) {
      try {
        await axios.delete(`${apiUrl}/websitelogodelete/${id}`);
        setLogos(prev => prev.filter(logo => logo.id !== id));
      } catch (err) {
        console.error("Error deleting logo:", err.response?.data || err.message);
        setError("Failed to delete logo. Please try again.");
      }
    }
  };

  const handleEditClick = (logo) => {
    setEditingLogo(logo.id);
    setFormData({ 
      brand_slogan: logo.brand_slogan, 
      image: null 
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("brand_slogan", formData.brand_slogan);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await axios.post(`${apiUrl}/websitelogosupdate/${editingLogo}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setRefreshKey(prev => prev + 1);
      setEditingLogo(null);
    } catch (err) {
      console.error("Error updating logo:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update logo. Please try again.");
    }
  };

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-800">Website Logos</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Slogan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logos.map((logo) => (
                <tr key={logo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {logo.brand_slogan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={`${logo.logo}?${refreshKey}`} 
                      className="h-16 w-auto object-contain" 
                      alt="Website Logo" 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditClick(logo)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(logo.id)}
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

      {editingLogo && (
        <UpdateWebsiteLogo
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingLogo={setEditingLogo}
        />
      )}
    </div>
  );
};

export default ViewWebsiteLogo;