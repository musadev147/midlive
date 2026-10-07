// ViewUser.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateUser from "./UpdateUser";

const apiUrl = config.apiUrl;

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "user",
    points: 0,
  });

  // Fetch all users data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/users`);
        setUsers(response.data.users || response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle delete user
  const handleDelete = async (userId, userType) => {
    if (userType === 'admin') {
      alert("Admin users cannot be deleted");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setDeleteLoading(true);
        await axios.delete(`${apiUrl}/userdelete/${userId}`);
        
        // Refresh user list after deletion
        const response = await axios.get(`${apiUrl}/users`);
        setUsers(response.data.users || response.data);
        
        setDeleteLoading(false);
      } catch (err) {
        console.error("Error deleting user:", err);
        setError(err.response?.data?.message || "Failed to delete user.");
        setDeleteLoading(false);
      }
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    if (user.type === 'admin') {
      alert("Admin users cannot be edited");
      return;
    }
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      phone: user.phone,
      type: user.type,
      points: user.points || 0,
    });
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  console.log("Form Data:", formData);
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      setLoading(true);
      await axios.put(`${apiUrl}/usersupdate/${editingUser}`, formData);


      
      // Refresh user list after update
      const response = await axios.get(`${apiUrl}/users`);
      setUsers(response.data.users || response.data);
      
      setEditingUser(null);
      setLoading(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Failed to update user.");
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !editingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.type === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.points || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.type !== 'admin' && (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.type)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-900"
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                    {user.type === 'admin' && (
                      <span className="text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        )}
      </div>

      {editingUser && (
        <UpdateUser
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setError={setError}
          setEditingUers={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default ViewUser;