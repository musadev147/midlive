import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateTransaction from "./UpdateTransaction";

const apiUrl = config.apiUrl;

const ViewTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    tnxNumber: "",
    tnxId: "",
  });

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/transactions`);
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${apiUrl}/transactiondelete/${id}`);
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
      } catch (err) {
        console.error("Error deleting transaction:", err);
        setError("Failed to delete transaction.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction.id);
    setFormData({
      tnxNumber: transaction.tnxNumber,
      tnxId: transaction.tnxId,
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

    if (!editingTransaction) {
      setError("No transaction selected for editing.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/transactionsupdate/${editingTransaction}`, formData);
      alert("Transaction updated successfully");
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction ? { ...transaction, ...formData } : transaction
        )
      );
      setEditingTransaction(null); // Clear editing state
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Transaction List</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Transaction Number</th>
            <th className="border border-gray-300 px-4 py-2">Transaction ID</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="border border-gray-300 px-4 py-2">{transaction.tnxNumber}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.tnxId}</td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleEditClick(transaction)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingTransaction && (
        <UpdateTransaction
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

export default ViewTransaction;
