// ViewSteadfast.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateSteadfast from "./UpdateSteadfast";

const apiUrl = config.apiUrl;

const ViewSteadfast = () => {
  const [steadfasts, setSteadfasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSteadfast, setEditingSteadfast] = useState(null);
  const [formData, setFormData] = useState({ 
    apiKey: "",
    secretKey: ""
  });

  useEffect(() => {
    const fetchSteadfasts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/steadfasts`);
        setSteadfasts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Steadfast:", err.response?.data || err.message);
        setError("Failed to load credentials. Please try again.");
        setLoading(false);
      }
    };
    fetchSteadfasts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete these credentials?")) {
      try {
        await axios.delete(`${apiUrl}/steadfastdelete/${id}`);
        setSteadfasts(prev => prev.filter(steadfast => steadfast.id !== id));
      } catch (err) {
        console.error("Error deleting Steadfast:", err.response?.data || err.message);
        setError("Failed to delete credentials. Please try again.");
      }
    }
  };

  const handleEditClick = (steadfast) => {
    setEditingSteadfast(steadfast.id);
    setFormData({ 
      apiKey: steadfast.apiKey,
      secretKey: steadfast.secretKey
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/steadfastsupdate/${editingSteadfast}`, formData);
      setSteadfasts(prev =>
        prev.map(steadfast =>
          steadfast.id === editingSteadfast ? { ...steadfast, ...formData } : steadfast
        )
      );
      setEditingSteadfast(null);
    } catch (err) {
      console.error("Error updating Steadfast:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update credentials.");
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
          <h2 className="text-2xl font-bold text-gray-800">Steadfast API Credentials</h2>
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
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secret Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {steadfasts.map((steadfast) => (
                <tr key={steadfast.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {steadfast.apiKey}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {steadfast.secretKey}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditClick(steadfast)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(steadfast.id)}
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

        {steadfasts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No Steadfast credentials found. Please add your API credentials.
          </div>
        )}
      </div>

      {editingSteadfast && (
        <UpdateSteadfast
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingSteadfast={setEditingSteadfast}
        />
      )}
    </div>
  );
};

export default ViewSteadfast;