import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Link } from "react-router-dom";
import UpdateForm from "./UpdateForm";

const apiUrl = config.apiUrl;

const ViewForm = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    slug: "",
    leadHeadline: "",
    leadButtonHeadline: "",
    leadButtonSubHeadline: "",
    redirectPage: "",
  });

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${apiUrl}/leads`);
        setLeads(response.data.leads);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads.");
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(`${apiUrl}/leaddelete/${id}`);
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      } catch (err) {
        console.error("Error deleting lead:", err);
        setError("Failed to delete lead.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({
      slug: lead.slug,
      leadHeadline: lead.leadHeadline,
      leadButtonHeadline: lead.leadButtonHeadline,
      leadButtonSubHeadline: lead.leadButtonSubHeadline,
      redirectPage: lead.redirectPage,
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

    if (!editingLead) {
      setError("No Form selected for editing.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/leadsupdate/${editingLead}`, formData);
      alert("Form updated successfully");
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === editingLead ? { ...lead, ...formData } : lead
        )
      );
      setEditingLead(null); // Clear editing state
    } catch (err) {
      console.error("Error updating Form:", err);
      setError("Failed to update Form.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Lead List</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Slug</th>
            <th className="border border-gray-300 px-4 py-2">Headline</th>
            <th className="border border-gray-300 px-4 py-2">Button Headline</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="border border-gray-300 px-4 py-2">{lead.slug}</td>
              <td className="border border-gray-300 px-4 py-2">{lead.leadHeadline}</td>
              <td className="border border-gray-300 px-4 py-2">{lead.leadButtonHeadline}</td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(lead)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(lead.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <Link
                  to={`/${lead.slug}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingLead && (
        <UpdateForm 
            formData ={formData}
            handleChange ={handleChange}
            handleSubmit ={handleSubmit}
            loading ={loading}
            error ={error}
        />
      )}
    </div>
  );
};

export default ViewForm;
