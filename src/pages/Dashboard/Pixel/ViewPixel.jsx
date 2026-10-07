// ViewPixel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePixel from "./UpdatePixel";

const apiUrl = config.apiUrl;

const ViewPixel = () => {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPixel, setEditingPixel] = useState(null);
  const [formData, setFormData] = useState({ pixel_id: "", fb_access_token: "" });

  useEffect(() => {
    const fetchPixels = async () => {
      try {
        const response = await axios.get(`${apiUrl}/pixels`);
        setPixels(response.data.pixels || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Pixels:", err.response?.data || err.message);
        setError("Failed to load Pixels. Please try again.");
        setLoading(false);
      }
    };
    fetchPixels();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pixel?")) {
      try {
        await axios.delete(`${apiUrl}/pixeldelete/${id}`);
        setPixels(prev => prev.filter(pixel => pixel.id !== id));
      } catch (err) {
        console.error("Error deleting pixel:", err.response?.data || err.message);
        setError("Failed to delete pixel. Please try again.");
      }
    }
  };

  const handleEditClick = (pixel) => {
    setEditingPixel(pixel.id);
    setFormData({ pixel_id: pixel.pixel_id, fb_access_token: pixel.fb_access_token });
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/pixelsupdate/${editingPixel}`, formData);
      setPixels(prev =>
        prev.map(pixel =>
          pixel.id === editingPixel ? { ...pixel, ...formData } : pixel
        )
      );
      setEditingPixel(null);
    } catch (err) {
      console.error("Error updating pixel:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update pixel.");
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Facebook Pixels</h2>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pixel ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FB Access Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pixels.map((pixel) => (
                <tr key={pixel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {pixel.pixel_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {pixel.fb_access_token || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditClick(pixel)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pixel.id)}
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

        {pixels.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No pixels found. Add your first Facebook Pixel ID.
          </div>
        )}
      </div>

      {editingPixel && (
        <UpdatePixel
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingPixel={setEditingPixel}
        />
      )}
    </div>
  );
};

export default ViewPixel;