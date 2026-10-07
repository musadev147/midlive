import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateAdvancePay from "./UpdateAdvancePay";

const apiUrl = config.apiUrl;

const ViewAdvancePay = () => {
  const [codAdvances, setCodAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '',
    sub_title: '',
    headline: '',
    pay_amount: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchCodAdvances = async () => {
      try {
        const response = await axios.get(`${apiUrl}/codadvances`);
        setCodAdvances(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching COD Advances:", err);
        setError("Failed to load COD Advances");
        setLoading(false);
      }
    };
    fetchCodAdvances();
  }, [apiUrl]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this COD Advance?")) {
      try {
        await axios.delete(`${apiUrl}/codadvancedelete/${id}`);
        setCodAdvances(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Error deleting COD Advance:", err);
        setError("Failed to delete COD Advance");
      }
    }
  };

  const handleEditClick = (codAdvance) => {
    setEditingId(codAdvance.id);
    setFormData({ 
      title: codAdvance.title,
      sub_title: codAdvance.sub_title,
      headline: codAdvance.headline,
      pay_amount: codAdvance.pay_amount,
      is_active: codAdvance.is_active,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) {
      setError("No COD Advance selected for editing");
      return;
    }

    try {
      await axios.put(`${apiUrl}/codadvancesupdate/${editingId}`, formData);
      alert("COD Advance updated successfully");
      setCodAdvances(prev => 
        prev.map(item => 
          item.id === editingId ? { ...item, ...formData } : item
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Error updating COD Advance:", err);
      setError(err.response?.data?.message || "Failed to update COD Advance");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading COD Advances...</div>;
  }

  if (codAdvances.length === 0) {
    return <div className="text-center py-8">No COD Advance data available</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">COD Advances</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codAdvances.map((codAdvance) => (
              <tr key={codAdvance.id}>
                <td className="px-6 py-4 whitespace-nowrap">{codAdvance.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{codAdvance.sub_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{codAdvance.headline}</td>
                <td className="px-6 py-4 whitespace-nowrap">{codAdvance.pay_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${codAdvance.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {codAdvance.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditClick(codAdvance)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(codAdvance.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <UpdateAdvancePay
          formData={formData}
          handleChange={handleChange}
          handleCheckboxChange={handleCheckboxChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingId(null)}
          loading={loading}
          setError={setError}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewAdvancePay;