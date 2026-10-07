import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateProductPage from "./UpdateProductPage";

const apiUrl = config.apiUrl;

const ViewProductPage = () => {
  const [productPages, setProductPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPages, setEditingPages] = useState(null);
  const [formData, setFormData] = useState({ 
            headline: "",
            paragraph: ""
  });

  useEffect(() => {
    const fetchProductPages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/productpages`);
        setProductPages(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching productpages:", err);
        setError("Failed to load productpages.");
        setLoading(false);
      }
    };
    fetchProductPages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pixel?")) {
      try {
        await axios.delete(`${apiUrl}/productpagedelete/${id}`);
        setProductPages((prev) => prev.filter((page) => page.id !== id));
      } catch (err) {
        console.error("Error deleting productpages:", err);
        setError("Failed to delete productpages.");
      }
    }
  };

  const handleEditClick = (page) => {
    setEditingPages(page.id);
    setFormData({ 
        headline: page.headline,
        paragraph: page.paragraph
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPages) {
      setError("No charge selected for editing.");
      return;
    }
    try {
      await axios.put(`${apiUrl}/productpagesupdate/${editingPages}`, formData);
      alert("Productpages updated successfully");
      setProductPages((prev) =>
        prev.map((page) =>
            page.id === editingPages ? { ...page, ...formData } : page
        )
      );
      setEditingPages(null);
    } catch (err) {
      console.error("Error updating Pages:", err);
      setError("Failed to update Pages.");
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Home Page / Product Page</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Headline</th>
            <th className="border border-gray-300 px-4 py-2">Paragraph</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productPages.map((page) => (
            <tr key={page.id}>
              <td className="border border-gray-300 px-4 py-2">{page.headline}</td>
                <td className="border border-gray-300 px-4 py-2">{page.paragraph}</td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(page)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingPages && (
        <UpdateProductPage
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewProductPage;