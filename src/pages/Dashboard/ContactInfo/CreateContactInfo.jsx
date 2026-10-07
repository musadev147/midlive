import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';

const apiUrl = config.apiUrl;

const CreateContactInfo = ({ onContactInfoCreated }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    tnx_number:''

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/contactinfos`, formData);
      alert('Contact information created successfully!');
      if (onContactInfoCreated) onContactInfoCreated();
      // Reset form after successful submission
      setFormData({
        email: '',
        phone: '',
        address: '',
      });
    } catch (err) {
      console.error('Error creating contact info:', err);
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else {
        setError(err.response?.data?.message || 'Failed to create contact information. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Contact Information</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="contact@example.com"
          />
          <p className="text-sm text-gray-500 mt-1">Must be a unique email address</p>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Phone*</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            maxLength="500"
            placeholder="Company address (optional)"
          />
          <p className="text-sm text-gray-500 mt-1">Maximum 500 characters</p>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Transaction Number*</label>
          <input
            name="tnx_number"
            value={formData.tnx_number}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="+1234567890"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Contact Info'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContactInfo;