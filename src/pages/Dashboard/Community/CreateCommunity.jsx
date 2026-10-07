import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateCommunity = ({ onCommunityCreated }) => {
  const [formData, setFormData] = useState({
    icon: null,
    name: "",
    description: "",
    image: null,
    banner: null,
    button_text: "",
    url: "",
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.post(`${apiUrl}/communities`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Community Created Successfully!");
      onCommunityCreated(); // Callback to refresh or update the page
      // Reset form
      setFormData({
        icon: null,
        name: "",
        description: "",
        image: null,
        banner: null,
        button_text: "",
        url: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create community.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create New Community</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Community Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Button Text</label>
          <input
            type="text"
            name="button_text"
            value={formData.button_text}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">URL</label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Icon</label>
          <input
            type="text"
            name="icon"
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="border w-full p-2 rounded"
            accept="image/*"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Banner</label>
          <input
            type="file"
            name="banner"
            onChange={handleChange}
            className="border w-full p-2 rounded"
            accept="image/*"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Community"}
        </button>
      </form>
    </div>
  );
};

export default CreateCommunity;