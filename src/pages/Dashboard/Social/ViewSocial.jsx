import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateSocial from "./UpdateSocial";

const apiUrl = config.apiUrl;

const ViewSocial = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "",
    icon_class: "",
    url: "",
    status: true,
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await axios.get(`${apiUrl}/sociallinks`);
        setSocialLinks(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Social Links:", err);
        setError("Failed to load Social Links.");
        setLoading(false);
      }
    };
    fetchSocialLinks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Social Link?")) {
      try {
        await axios.delete(`${apiUrl}/sociallinkdelete/${id}`);
        setSocialLinks((prev) => prev.filter((link) => link.id !== id));
      } catch (err) {
        console.error("Error deleting Social Link:", err);
        setError("Failed to delete Social Link.");
      }
    }
  };

  const handleEditClick = (link) => {
    setEditingLink(link.id);
    setFormData({ 
      name: link.name,
      icon_class: link.icon_class,
      url: link.url,
      status: link.status,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLink) {
      setError("No social link selected for editing.");
      return;
    }
    try {
      await axios.put(`${apiUrl}/sociallinksupdate/${editingLink}`, formData);
      alert("Social Link updated successfully");
      setSocialLinks((prev) =>
        prev.map((link) =>
          link.id === editingLink ? { ...link, ...formData } : link
        )
      );
      setEditingLink(null);
    } catch (err) {
      console.error("Error updating social link:", err);
      setError("Failed to update social link.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Social Links</h2>
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Icon Class</th>
            <th className="border border-gray-300 px-4 py-2">URL</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {socialLinks.map((link) => (
            <tr key={link.id}>
              <td className="border border-gray-300 px-4 py-2">{link.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                <i className={link.icon_class}></i> {link.icon_class}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {link.url.length > 30 ? `${link.url.substring(0, 30)}...` : link.url}
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${link.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {link.status ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(link)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {editingLink && (
        <UpdateSocial
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel = {() => setEditingLink(null)}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewSocial;