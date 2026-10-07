import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';

const apiUrl = config.apiUrl;

const CreateAdvancePay = ({ onCodAdvanceCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    headline: '',
    pay_amount: '',
    is_active: true,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/codadvances`, formData);
      alert('COD Advance created successfully!');
      if (onCodAdvanceCreated) onCodAdvanceCreated();
      // Reset form after successful submission
      setFormData({
        title: '',
        sub_title: '',
        headline: '',
        pay_amount: '',
        is_active: true,
      });
    } catch (err) {
      console.error('Error creating COD Advance:', err);
      setError(err.response?.data?.message || 'Failed to create COD Advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create COD Advance</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Sub Title</label>
          <input
            name="sub_title"
            value={formData.sub_title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="Enter sub title"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Headline</label>
          <textarea
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter headline"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Pay Amount</label>
          <input
            type="number"
            name="pay_amount"
            value={formData.pay_amount}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter pay amount"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-gray-700">
            Is Active
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create COD Advance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdvancePay;