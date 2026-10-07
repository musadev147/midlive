import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateCongratulation = ({ onCongratesCreated }) => {
  const [formData, setFormData] = useState({
    headline: "",
    subHeadline: "",
    paragraph: "",
    contactInfoText: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${apiUrl}/congratulations`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Congratulation Created Successfully!");
      onCongratesCreated();
    } catch (err) {
      setError("An error occurred while creating the congratulation.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Congratulation</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Headline</label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Sub Headline</label>
          <input
            type="text"
            name="subHeadline"
            value={formData.subHeadline}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Paragraph</label>
          <textarea
            name="paragraph"
            value={formData.paragraph}
            onChange={handleChange}
            className="border w-full p-2"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contact Info Text</label>
          <input
            type="text"
            name="contactInfoText"
            value={formData.contactInfoText}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Congratulation
        </button>
      </form>
    </div>
  );
};

export default CreateCongratulation;
