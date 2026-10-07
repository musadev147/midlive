import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';

const apiUrl = config.apiUrl;

const CreateBonus = ({ onCoinCreated }) => {
  const [formData, setFormData] = useState({
    first_reg_bonus: '',
    bonus_percentage: '',
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
      await axios.post(`${apiUrl}/bonuscoins`, formData);
      alert('Bonus Coins created successfully!');
      if (onCoinCreated) onCoinCreated();
      // Reset form after successful submission
      setFormData({
        first_reg_bonus: '',
        bonus_percentage: '',
      });
    } catch (err) {
      console.error('Error creating contact info:', err);
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
          <label className="block text-gray-700 mb-1">First Registration Bonus</label>
          <input
            name="first_reg_bonus"
            value={formData.first_reg_bonus}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="e.g. 100, 200, 300 etc."
          />
          <p className="text-sm text-gray-500 mt-1">This is First Registration Bonus Coins</p>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Percentage of Purchage</label>
          <input
            name="bonus_percentage"
            value={formData.bonus_percentage}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="e.g. 10% or 20%"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Coin Name</label>
          <input
            name="coin_name"
            value={formData.coin_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="e.g. BTC, ETH, Sunnah Coin etc."
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

export default CreateBonus;