import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateForm = ({ onFormCreated }) => {
  const [formData, setFormData] = useState({
    slug: "",
    leadHeadline: "",
    leadButtonHeadline: "",
    leadButtonSubHeadline: "",
    redirectPage: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${apiUrl}/leads`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Lead Created Successfully!");
      onFormCreated();
    } catch (err) {
      setError("An error occurred while creating the lead.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Lead</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Lead Headline</label>
          <input
            type="text"
            name="leadHeadline"
            value={formData.leadHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Lead Button Headline</label>
          <input
            type="text"
            name="leadButtonHeadline"
            value={formData.leadButtonHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Lead Button Sub Headline</label>
          <input
            type="text"
            name="leadButtonSubHeadline"
            value={formData.leadButtonSubHeadline}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Redirect Page</label>
          <input
            type="text"
            name="redirectPage"
            value={formData.redirectPage}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Lead
        </button>
      </form>
    </div>
  );
};

export default CreateForm;
