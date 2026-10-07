import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateLead from "./UpdateLead";

const apiUrl = config.apiUrl;

const ViewLead = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    product_name: "",
    product_price: "",
    quantity: 1,
    status: "lead"
  });


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
        setLeads(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setPerPage(response.data.per_page);
        setTotal(response.data.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads.");
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await axios.delete(`${apiUrl}/leads/${id}`);
        // Refresh the current page after deletion
        const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
        setLeads(response.data.data);
      } catch (err) {
        console.error("Error deleting lead:", err);
        setError("Failed to delete lead.");
      }
    }
  };

  const handleConvertToOrder = async (id) => {
  if (window.confirm("Are you sure you want to convert this lead to an order?")) {
    try {
      // 1. First get the lead data
      const leadResponse = await axios.get(`${apiUrl}/leads/${id}`);
      const leadData = leadResponse.data;
      console.log(leadData)

      // 2. Prepare complete customer data from lead
      const customerData = {
        order_id: leadData.order_id || generateOrderId(), // Ensure order_id exists
        customer_name: leadData.customer_name,
        phone_number: leadData.phone_number,
        customer_address: leadData.customer_address || 'Not specified',
        product_name: leadData.product_name || 'Not specified',
        quantity: leadData.quantity || 1,
        total:leadData.product_price,
        delivery_status: '', 
        delivery_note:'পন্য না নিলে ডেলিভারী চার্জ ১২০ টাকা নিয়ে আসবেন।'
      };

      console.log(customerData)

      // 3. Create customer with all required fields
      await axios.post(`${apiUrl}/customers`, customerData);

      // 4. Mark lead as converted
      await axios.post(`${apiUrl}/leads/${id}/convert`);

      // 5. Refresh the leads list
      const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
      setLeads(response.data.data);

      alert("Lead successfully converted to customer and order");
    } catch (err) {
      console.error("Error converting lead:", err);
      setError("Failed to convert lead to order. " + 
        (err.response?.data?.errors 
          ? Object.values(err.response.data.errors).join(' ') 
          : err.message)
      );
    }
  }
};

// Helper function to generate order ID if not provided
const generateOrderId = () => {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
};

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({
      customer_name: lead.customer_name,
      phone_number: lead.phone_number,
      product_name: lead.product_name || "",
      product_price: lead.product_price || "",
      quantity: lead.quantity || 1,
      status: lead.status
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLead) {
      setError("No lead selected for editing.");
      return;
    }
    try {
      await axios.put(`${apiUrl}/leads/${editingLead}`, formData);
      alert("Lead updated successfully");
      // Refresh the current page after update
      const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
      setLeads(response.data.data);
      setEditingLead(null);
    } catch (err) {
      console.error("Error updating lead:", err);
      setError("Failed to update lead.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Leads Management</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {leads.length} of {total} leads (Page {currentPage} of {lastPage})
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.customer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.product_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.product_price ? `৳${lead.product_price}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.quantity || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    lead.status === 'converted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleConvertToOrder(lead.id)}
                      className="text-green-600 hover:text-green-900"
                      disabled={lead.status === 'converted'}
                    >
                      Convert
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Previous
          </button>
          
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border-t border-b ${currentPage === page ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className={`px-3 py-2 rounded-r-md border ${currentPage === lastPage ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Next
          </button>
        </nav>
      </div>

      {editingLead && (
        <div className="mt-8 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <UpdateLead
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onCancel={() => setEditingLead(null)}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default ViewLead;