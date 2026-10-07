// ViewLegal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateLegal from "./UpdateLegal";
import { Link } from "react-router-dom";

const apiUrl = config.apiUrl;

const ViewLegal = () => {
  const [legalPages, setLegalPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLegal, setEditingLegal] = useState(null);
  const [formData, setFormData] = useState({ 
    id: "",
    title: "",
    content: "",
    slug: "",
  });

  useEffect(() => {
    const fetchLegalPages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/legalpages`);
        setLegalPages(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching legal pages:", err);
        setError("Failed to load legal pages. Please try again.");
        setLoading(false);
      }
    };
    fetchLegalPages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this legal page?")) {
      try {
        await axios.delete(`${apiUrl}/legalpagedelete/${id}`);
        setLegalPages(prev => prev.filter(legal => legal.id !== id));
      } catch (err) {
        console.error("Error deleting legal page:", err);
        setError("Failed to delete legal page. Please try again.");
      }
    }
  };

  const handleEditClick = (legal) => {
    setEditingLegal(legal.id);
    setFormData({ 
      id: legal.id,
      slug: legal.slug,
      title: legal.title,
      content: legal.content,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/legalpagesupdate/${formData.id}`, formData);
      setLegalPages(prev =>
        prev.map(legal => legal.id === formData.id ? { ...legal, ...formData } : legal)
      );
      setEditingLegal(null);
    } catch (err) {
      console.error("Error updating legal page:", err);
      setError(err.response?.data?.message || "Failed to update legal page.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Legal Pages</h2>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {legalPages.map((legal) => (
                <tr key={legal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {legal.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {legal.slug}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: legal.content.slice(0, 50) + (legal.content.length > 50 ? "..." : "") 
                      }} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link to={`/legal/${legal.slug}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleEditClick(legal)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(legal.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingLegal && (
        <UpdateLegal
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleQuillChange={handleQuillChange}
          setEditingLegal={setEditingLegal}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewLegal;