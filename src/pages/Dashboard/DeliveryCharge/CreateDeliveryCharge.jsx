import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateDeliveryCharge = ({ onDeliveryChargeCreated }) => {
  const [formData, setFormData] = useState({
    district_name: "",
    delivery_charge: "",
    estimated_days: "",
    delivery_note: ""
  });
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/deliverycharges`, formData);
      alert("Delivery Charge Created Successfully!");
      onDeliveryChargeCreated();
      // Reset form after successful submission
      setFormData({
        district_name: "",
        delivery_charge: "",
        estimated_days: "",
        delivery_note: ""
      });
    } catch (err) {
      setError("An error occurred while creating the delivery charge.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Delivery Charge</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">District Name</label>
          <input
            type="text"
            name="district_name"
            value={formData.district_name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            placeholder="e.g. মাদারীপুরের ভেতরে"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Delivery Charge (৳)</label>
          <input
            type="number"
            name="delivery_charge"
            value={formData.delivery_charge}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            placeholder="e.g. 50"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Estimated Delivery Days</label>
          <input
            type="number"
            name="estimated_days"
            value={formData.estimated_days}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            placeholder="e.g. 2"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Delivery Note</label>
          <textarea
            name="delivery_note"
            value={formData.delivery_note}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows="3"
            placeholder="e.g. 50 Taka Delivery Charge"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Create Delivery Charge
        </button>
      </form>
    </div>
  );
};

export default CreateDeliveryCharge;