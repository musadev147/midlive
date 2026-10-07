import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateCommunity from "./UpdateCommunity";
import { Link } from "react-router-dom";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    icon: null,
    name: "",
    description: "",
    image: null,
    banner: null,
    button_text: "",
    url: "",
  });

  // Fetch communities from API
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${apiUrl}/communities`);
        setCommunities(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities.");
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      try {
        await axios.delete(`${apiUrl}/communitydelete/${id}`);
        setCommunities((prev) => prev.filter((community) => community.id !== id));
      } catch (err) {
        console.error("Error deleting community:", err);
        setError("Failed to delete community.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (community) => {
    setEditingCommunity(community.id);
    setFormData({
      icon: community.icon,
      name: community.name,
      description: community.description,
      image: community.image,
      banner: community.banner,
      button_text: community.button_text,
      url: community.url,
    });
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Changes
  const setImage = (file) => setFormData(prev => ({ ...prev, image: file }));
  const setBanner = (file) => setFormData(prev => ({ ...prev, banner: file }));

  // Handle Form Submit with Progress Tracking
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCommunity) {
      setError("No community selected for editing.");
      return;
    }

    const data = new FormData();
    data.append("_method", "PUT");

    Object.keys(formData).forEach(key => {
      const value = formData[key];

      // Check if it's a File for image or banner fields
      if ((key === "image" || key === "banner") && value instanceof File) {
        data.append(key, value);
      } else if (key !== "image" && key !== "banner" && value !== null) {
        data.append(key, value);
      }
    });


    try {
      await axios.post(`${apiUrl}/communitiesupdate/${editingCommunity}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Community updated successfully");
      setCommunities((prev) =>
        prev.map((community) =>
          community.id === editingCommunity ? { ...community, ...formData } : community
        )
      );
      setEditingCommunity(null);
      setUploadProgress(0);
    } catch (err) {
      console.error("Error updating community:", err);
      setError(err?.response?.data?.message || "Failed to update community.");
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Communities</h2>
      {error && <p className="text-red-500">{error}</p>}
      
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Button Text</th>
            <th className="border border-gray-300 px-4 py-2">URL</th>
            <th className="border border-gray-300 px-4 py-2">Icon</th>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Banner</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {communities.map((community) => (
            <tr key={community.id}>
              <td className="border border-gray-300 px-4 py-2">{community.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {community.description.length > 50 
                  ? `${community.description.substring(0, 50)}...` 
                  : community.description}
              </td>
              <td className="border border-gray-300 px-4 py-2">{community.button_text}</td>
              <td className="border border-gray-300 px-4 py-2">{community.url}</td>
              <td className="border border-gray-300 px-4 py-2">
                {community.icon}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {community.image && (
                  <img 
                    src={`${imageUrl}/${community.image}`} 
                    alt="Community" 
                    className="w-16 h-16 object-cover"
                  />
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {community.banner && (
                  <img 
                    src={`${imageUrl}/${community.banner}`} 
                    alt="Banner" 
                    className="w-32 h-16 object-cover"
                  />
                )}
              </td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(community)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(community.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingCommunity && (
        <UpdateCommunity
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setImage={setImage}
          setBanner={setBanner}
          uploadProgress={uploadProgress}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewCommunity;