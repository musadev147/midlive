import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import ReactQuill from "react-quill"; // ReactQuill ইম্পোর্ট
import "react-quill/dist/quill.snow.css"; // Quill এর স্টাইল ইম্পোর্ট


const apiUrl = config.apiUrl;

const CreateLegal = ({ onLegalCreated }) => {
  const [formData, setFormData] = useState({		
    title: "",
    content: "",
  });
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value || "", // খালি ভ্যালুর জন্য "" সেট করুন
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/legalpages`, formData);
      alert("Legal Page Created Successfully!");
      onLegalCreated();
    } catch (err) {
        console.error("API Error:", err.response ? err.response.data : err.message);
      setError("An error occurred while creating the Legal.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Legal Page</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Content</label>
            <ReactQuill
                value={formData.content} // Ensure Quill gets a valid string
                onChange={handleQuillChange}
                className="border w-full p-2"
            />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Legal Page
        </button>
      </form>
    </div>
  );
};

export default CreateLegal;
