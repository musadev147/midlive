import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateTnx from "./UpdateTnx";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewTnx = () => {
  const [tnxes, setTnxes] = useState([]);
  const [packageCoin, setPackageCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTnx, setEditingTnx] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '',
    phone: '',
    wallet_number: '',
    coin_package_id: '',
    status: '',
  });



  useEffect(() => {
    const fetchData = async () => {
      try {
        // প্রথমে সব প্যাকেজ fetch করুন
        const responsePack = await axios.get(`${apiUrl}/coinpackages`);
        const allPackages = responsePack.data;

        // তারপর সব ট্রানজেকশন fetch করুন
        const response = await axios.get(`${apiUrl}/cointransactions`);
        
        // ট্রানজেকশন ডাটা সেট করুন
        setTnxes(response.data);
        // সব প্যাকেজ ডাটা সেট করুন
        setPackageCoin(allPackages);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);



  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${apiUrl}/cointransactions/${id}`);
        setTnxes(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category");
      }
    }
  };

  const handleEditClick = (tnx) => {
    setEditingTnx(tnx.id);
    setFormData({ 
        name: tnx.name,
        phone: tnx.phone,
        wallet_number: tnx.wallet_number,
        coin_package_id: tnx.coin_package_id,
        status: tnx.status,
    });
  };

  const handleChange = (e) => {
    const { name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleAddPoints = async (tnx) => {
    try {
      // Find the corresponding package to get the coins
      const pack = packageCoin.find(pkg => pkg.id === tnx.coin_package_id);
      if (!pack) {
        setError("Package not found");
        return;
      }
  
      // Step 1: Add points to user
      const pointsResponse = await axios.post(`${apiUrl}/users/${tnx.phone}/add-points`, {
        points: pack.coins
      });
      
      // Step 2: Update transaction status in backend
      await axios.put(`${apiUrl}/cointransactions/${tnx.id}/update-status`);
      
      alert(`পয়েন্ট যোগ করা হয়েছে! যোগ হয়েছে: ${pack.coins}, মোট পয়েন্ট: ${pointsResponse.data.total_points}`);
      
      // Step 3: Update local state
      setTnxes(prev => prev.map(t => 
        t.id === tnx.id ? { ...t, status: true } : t
      ));
      
    } catch (err) {
      console.error("Error adding points:", err);
      setError(err.response?.data?.message || "Failed to add points.");
    }
  };

   

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTnx) {
      setError("No category selected for editing");
      return;
    }


    try {
      await axios.put(`${apiUrl}/cointransactions/${editingTnx}`, formData);
      
      alert("tnxage updated successfully");
      setTnxes(prev => prev.map(tnx => tnx.id === editingTnx ? { ...tnx, ...formData } : tnx));
      
      setFormData({  
        name: '',
        coins: '',
        price: '',
        is_active: '',
        });
        setEditingTnx(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading Tnx...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Coin Tnx</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      
        
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Coins</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {tnxes.map(tnx => (
                        <tr key={tnx.id} className="hover:bg-gray-100">
                            <td className="px-6 py-4 whitespace-nowrap">{tnx.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{tnx.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{tnx.wallet_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{packageCoin.find(pkg => pkg.id === tnx.coin_package_id)?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{packageCoin.find(pkg => pkg.id === tnx.coin_package_id)?.price || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{packageCoin.find(pkg => pkg.id === tnx.coin_package_id)?.coins || 'N/A'}</td>
                           <td className="px-6 py-4 whitespace-nowrap"> 
                              <button
                                onClick={() => handleAddPoints(tnx)}
                                className={`font-medium ${tnx.status ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-900'}`}
                                disabled={tnx.status}
                              >
                                {tnx.status ? 'Added' : 'Add Points'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                <button
                                onClick={() => handleEditClick(tnx)}
                                className="text-blue-600 hover:text-blue-900"
                                >
                                Edit
                                </button>
                                <button
                                onClick={() => handleDelete(tnx.id)}
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
        
        

      {editingTnx && (
        <UpdateTnx
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingTnx(null)}
          loading={loading}
          setError={setError}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewTnx;