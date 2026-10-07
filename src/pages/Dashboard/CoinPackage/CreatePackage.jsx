import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';

const apiUrl = config.apiUrl;

const CreatePackage = ({ onPackageCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    coins: '',
    price: '',
    is_active: false,
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
      await axios.post(`${apiUrl}/coinpackages`, formData);
      alert('Bonus Coins created successfully!');
      if (onPackageCreated) onPackageCreated();
      // Reset form after successful submission
      setFormData({
        name: '',
        coins: '',
        price: '',
        is_active: false,
      });
    } catch (err) {
      console.error('Error creating contact info:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Package Coin</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name Of Package</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="Eid Special"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Package Coins</label>
          <input
            name="coins"
            value={formData.coins}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="Enter Package Coin"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Package Price</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="Enter Package Price"
          />
        </div>

        <div className="flex items-center mb-4">
        <label className="text-gray-700">Is Active</label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="mr-2"
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

export default CreatePackage;