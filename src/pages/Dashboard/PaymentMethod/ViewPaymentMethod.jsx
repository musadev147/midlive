import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePaymentMethod from "./UpdatePaymentMethod";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewPaymentMethod = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    payment_method: "",
    payment_number: ""
  });
  const [imagePreview, setImagePreview] = useState(null);

  console.log(formData)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/paymentmethod`);
        setPayments(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payment methods.");
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      try {
        await axios.delete(`${apiUrl}/paymentmethoddelete/${id}`);
        setPayments(prev => prev.filter(payment => payment.id !== id));
      } catch (err) {
        console.error("Error deleting payment:", err);
        setError("Failed to delete payment method.");
      }
    }
  };

  const handleEditClick = (payment) => {
    setEditingPayment(payment.id);
    setFormData({
      payment_method: payment.payment_method,
      payment_number: payment.payment_number,
      image: payment.image
    });
    setImagePreview(payment.image ? `${imageUrl}/${payment.image}` : null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPayment) {
      setError("No payment selected for editing.");
      return;
    }

    const data = new FormData();
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }
    data.append('payment_method', formData.payment_method);
    data.append('payment_number', formData.payment_number);
    data.append('_method', 'PUT');

    try {
      const response = await axios.post(`${apiUrl}/paymentmethodupdate/${editingPayment}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert("Payment method updated successfully");
      setPayments(prev =>
        prev.map(payment =>
          payment.id === editingPayment ? response.data : payment
        )
      );
      setEditingPayment(null);
    } catch (err) {
      console.error("Error updating payment:", err);
      setError("Failed to update payment method.");
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
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Payment Methods</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number/Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.payment_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.payment_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.image && (
                    <img 
                      src={`${imageUrl}/${payment.image}`} 
                      alt={payment.payment_method} 
                      className="h-12 object-contain"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(payment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
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

      {editingPayment && (
        <div className="mt-8 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <UpdatePaymentMethod
            formData={formData}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            handleSubmit={handleSubmit}
            onCancel={() => setEditingPayment(null)}
            loading={loading}
            error={error}
            imagePreview={imagePreview}
          />
        </div>
      )}
    </div>
  );
};

export default ViewPaymentMethod;