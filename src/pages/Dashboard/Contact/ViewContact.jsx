import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';
import UpdateContact from './UpdateContact';

const apiUrl = config.apiUrl;

const ViewContact = () => {
  const [contacts, setContacts] = useState(['']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    status: true,
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/contacts`);
        
        // ডাটা অ্যারে কিনা চেক করুন
        const contactsData = Array.isArray(response.data) ? response.data : [response.data];
        
        setContacts(contactsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts.');
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`${apiUrl}/contactdelete/${id}`);
        setContacts(prev => prev.filter(contact => contact.id !== id));
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact.');
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact.id);
    setFormData({
      id: contact.id, // Make sure to include the ID
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
    });
  };
  const handleStatusChange = async (id, currentStatus) => {
    try {
      
      const updatedStatus = !currentStatus;
      await axios.put(`${apiUrl}/contactsupdate/${id}`, { status: updatedStatus });
      setContacts(prev =>
        prev.map(contact =>
          contact.id === id ? { ...contact, status: updatedStatus } : contact
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update contact status.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading contacts...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Contact Messages</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{contact.phone}</td>
                <td className="px-6 py-4">{contact.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    onClick={() => handleStatusChange(contact.id, contact.status)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      contact.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {contact.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditClick(contact)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingContact && (
        <UpdateContact
          formData={formData}
          setFormData={setFormData}
          onUpdate={() => {
            setContacts(prev =>
              prev.map(contact =>
                contact.id === editingContact ? { ...contact, ...formData } : contact
              )
            );
            setEditingContact(null);
          }}
          onCancel={() => setEditingContact(null)}
        />
      )}
    </div>
  );
};

export default ViewContact;