import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateDeliveryCharge from "./UpdateDeliveryCharge";

const apiUrl = config.apiUrl;

const ViewDeliveryCharge = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCharge, setEditingCharge] = useState(null);
  const [formData, setFormData] = useState({
    district_name: "",
    delivery_charge: "",
    estimated_days: "",
    delivery_note: ""
  });

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await axios.get(`${apiUrl}/deliverycharges`);
        setCharges(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching delivery charges:", err);
        setError("Failed to load delivery charges.");
        setLoading(false);
      }
    };
    fetchCharges();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this charge?")) {
      try {
        await axios.delete(`${apiUrl}/deliverychargedelete/${id}`);
        setCharges(prev => prev.filter(charge => charge.id !== id));
      } catch (err) {
        console.error("Error deleting charge:", err);
        setError("Failed to delete delivery charge.");
      }
    }
  };

  const handleEditClick = (charge) => {
    setEditingCharge(charge.id);
    setFormData({
      district_name: charge.district_name,
      delivery_charge: charge.delivery_charge,
      estimated_days: charge.estimated_days,
      delivery_note: charge.delivery_note
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingCharge) {
      setError("No charge selected for editing.");
      return;
    }
    try {
      await axios.put(`${apiUrl}/deliverychargesupdate/${editingCharge}`, formData);
      alert("Delivery charge updated successfully");
      setCharges(prev =>
        prev.map(charge =>
          charge.id === editingCharge ? { ...charge, ...formData } : charge
        )
      );
      setEditingCharge(null);
    } catch (err) {
      console.error("Error updating charge:", err);
      setError("Failed to update delivery charge.");
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
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Delivery Charges</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge (৳)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {charges.map((charge) => (
              <tr key={charge.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {charge.district_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {charge.delivery_charge}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {charge.estimated_days}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {charge.delivery_note || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(charge)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(charge.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCharge && (
        <div className="mt-8 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <UpdateDeliveryCharge
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onCancel = {() => setEditingCharge(null)}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default ViewDeliveryCharge;