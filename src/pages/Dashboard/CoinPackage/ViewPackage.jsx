import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePackage from "./UpdatePackage";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewPackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '',
    coins: '',
    price: '',
    is_active: false,
  });



  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(`${apiUrl}/coinpackages`);
        setPackages(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load packages");
        setLoading(false);
      }
    };
    fetchPackage();
  }, [apiUrl]);

  console.log(packages);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${apiUrl}/coinpackages/${id}`);
        setPackages(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category");
      }
    }
  };

  const handleEditClick = (pack) => {
    setEditingPackage(pack.id);
    setFormData({ 
        name: pack.name,
        coins: pack.coins,
        price: pack.price,
        is_active: pack.is_active,
    });
  };

  const handleChange = (e) => {
    const { name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


   

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPackage) {
      setError("No category selected for editing");
      return;
    }


    try {
      await axios.put(`${apiUrl}/coinpackages/${editingPackage}`, formData);
      
      alert("Package updated successfully");
      setPackages(prev => prev.map(pkg => pkg.id === editingPackage ? { ...pkg, ...formData } : pkg));
      
      setFormData({  
        name: '',
        coins: '',
        price: '',
        is_active: false,
        });
        setEditingPackage(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading Package...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Coin Package</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      
        
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {packages.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4 whitespace-nowrap">{pkg.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{pkg.coins}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{pkg.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{pkg.is_active ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button
                                onClick={() => handleEditClick(pkg)}
                                className="text-blue-600 hover:text-blue-900"
                                >
                                Edit
                                </button>
                                <button
                                onClick={() => handleDelete(pkg.id)}
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
        
        

      {editingPackage && (
        <UpdatePackage
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingPackage(null)}
          loading={loading}
          setError={setError}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewPackage;