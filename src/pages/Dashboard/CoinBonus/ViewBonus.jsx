import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateBonus from "./UpdateBonus";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewBonus = () => {
  const [bonus, setBonus] = useState(null); // Initialize as null instead of {}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBonus, setEditingBonus] = useState(null);
  const [formData, setFormData] = useState({ 
    first_reg_bonus: '',
    bonus_percentage: '',
    coin_name: '',
  });

  useEffect(() => {
    const fetchBonus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/bonuscoins`);
        setBonus(response?.data?.[0] || null); // Handle case where response.data is empty
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Bonus:", err);
        setError("Failed to load Bonus");
        setLoading(false);
      }
    };
    fetchBonus();
  }, [apiUrl]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bonus?")) {
      try {
        await axios.delete(`${apiUrl}/bonuscoins/${id}`);
        setBonus(null); // Since there's only one bonus, set to null after deletion
      } catch (err) {
        console.error("Error deleting bonus:", err);
        setError("Failed to delete bonus");
      }
    }
  };

  const handleEditClick = (bonus) => {
    setEditingBonus(bonus.id);
    setFormData({ 
      first_reg_bonus: bonus.first_reg_bonus,
      bonus_percentage: bonus.bonus_percentage,
      coin_name: bonus.coin_name,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingBonus) {
      setError("No bonus selected for editing");
      return;
    }

    try {
      await axios.put(`${apiUrl}/bonuscoins/${editingBonus}`, formData);
      alert("Bonus updated successfully");
      setBonus(prev => ({
        ...prev,
        ...formData
      }));
      setFormData({  
        first_reg_bonus: '',
        bonus_percentage: '',
        coin_name: '',
      });
      setEditingBonus(null);
    } catch (err) {
      console.error("Error updating bonus:", err);
      setError(err.response?.data?.message || "Failed to update bonus");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bonus...</div>;
  }

  if (!bonus) {
    return <div className="text-center py-8">No bonus data available</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Bonus</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Welcome Bonus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Bonus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">{bonus.first_reg_bonus}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {bonus.bonus_percentage}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {bonus.coin_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => handleEditClick(bonus)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bonus.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {editingBonus && (
        <UpdateBonus
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingBonus(null)}
          loading={loading}
          setError={setError}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewBonus;