import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateHome from "./UpdateHome";
import { Link } from "react-router-dom";

const apiUrl = config.apiUrl;

const ViewHome = () => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHome, setEditingHome] = useState(null);
  const [formData, setFormData] = useState({
    headline: "",
    slug: "",
    paragraph: "",
    description: "",
  });

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/homepages`);
        setHomes(response.data.homePages);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching homes:", err);
        setError("Failed to load homepages.");
        setLoading(false);
      }
    };

    fetchHomes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this homepage?")) {
      try {
        await axios.delete(`${apiUrl}/homepagedelete/${id}`);
        setHomes(prev => prev.filter(home => home.id !== id));
      } catch (err) {
        console.error("Error deleting homepage:", err);
        setError("Failed to delete homepage.");
      }
    }
  };

  const handleEditClick = (home) => {
    setEditingHome(home.id);
    setFormData({
      headline: home.headline,
      slug: home.slug,
      paragraph: home.paragraph,
      description: home.description,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleQuillChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingHome) {
      setError("No homepage selected for editing.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/homepagesupdate/${editingHome}`, formData);
      
      alert("Homepage updated successfully");
      setHomes(prev =>
        prev.map(home =>
          home.id === editingHome ? { ...home, ...formData } : home
        )
      );
      setEditingHome(null);
    } catch (err) {
      console.error("Error updating homepage:", err);
      setError(err.response?.data?.message || "Failed to update homepage.");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading homepages...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Homepage List</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paragraph</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {homes.map(home => (
              <tr key={home.id}>
                <td className="px-6 py-4 whitespace-nowrap">{home.slug}</td>
                <td className="px-6 py-4">{home.headline}</td>
                <td className="px-6 py-4">{home.paragraph}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditClick(home)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(home.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  <Link 
                    to={`/${home.slug}`} 
                    className="text-green-600 hover:text-green-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingHome && (
        <UpdateHome
          formData={formData}
          handleChange={handleChange}
          handleQuillChange={handleQuillChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewHome;