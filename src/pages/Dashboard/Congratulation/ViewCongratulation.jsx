import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { MdAddLink } from "react-icons/md";
import { Link } from "react-router-dom";
import UpdateCongratulation from "./UpdateCongratulation";

const apiUrl = config.apiUrl;

const ViewCongratulation = () => {
  const [congratulations, setCongratulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCongratulation, setEditingCongratulation] = useState(null);
  const [formData, setFormData] = useState({
    headline: "",
    subHeadline: "",
    paragraph: "",
    contactInfoText: "",
  });

  // Fetch congratulation entries from API
  useEffect(() => {
    const fetchCongratulations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/congratulations`);
        setCongratulations(response.data.congratulations);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching congratulations:", err);
        setError("Failed to load congratulations.");
        setLoading(false);
      }
    };

    fetchCongratulations();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${apiUrl}/congratulationdelete/${id}`);
        setCongratulations((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Error deleting entry:", err);
        setError("Failed to delete entry.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (congratulation) => {
    setEditingCongratulation(congratulation.id);
    setFormData({
      headline: congratulation.headline,
      subHeadline: congratulation.subHeadline,
      paragraph: congratulation.paragraph,
      contactInfoText: congratulation.contactInfoText,
    });
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingCongratulation) {
      setError("No entry selected for editing.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/congratulationsupdate/${editingCongratulation}`, formData);
      alert("Congratulation entry updated successfully");
      setCongratulations((prev) =>
        prev.map((item) =>
          item.id === editingCongratulation ? { ...item, ...formData } : item
        )
      );
      setEditingCongratulation(null); // Clear editing state
    } catch (err) {
      console.error("Error updating congratulation entry:", err);
      setError("Failed to update entry.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Congratulation List</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Headline</th>
            <th className="border border-gray-300 px-4 py-2">Sub Headline</th>
            <th className="border border-gray-300 px-4 py-2">Paragraph</th>
            <th className="border border-gray-300 px-4 py-2">Contact Info</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {congratulations.map((item) => (
            <tr key={item.id}>
              <td className="border border-gray-300 px-4 py-2">{item.headline}</td>
              <td className="border border-gray-300 px-4 py-2">{item.subHeadline}</td>
              <td className="border border-gray-300 px-4 py-2">{item.paragraph}</td>
              <td className="border border-gray-300 px-4 py-2">{item.contactInfoText}</td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingCongratulation && (
        <UpdateCongratulation 
          formData = {formData} 
          handleChange ={handleChange}
          handleSubmit={handleSubmit}
          loading={loading} 
          error={error}
        />
      )}
    </div>
  );
};

export default ViewCongratulation;
