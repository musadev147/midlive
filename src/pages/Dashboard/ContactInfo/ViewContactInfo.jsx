import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { config } from '../../../config';
import UpdateContactInfo from './UpdateContactInfo';

const apiUrl = config.apiUrl;

const ViewContactInfo = () => {
  const [contactInfos, setContactInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchContactInfos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/contactinfos`);
        setContactInfos(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contact information:', err);
        setError('Failed to load contact information.');
        setLoading(false);
      }
    };
    fetchContactInfos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact information?')) {
      try {
        await axios.delete(`${apiUrl}/contactinfodelete/${id}`);
        setContactInfos(prev => prev.filter(contact => contact.id !== id));
      } catch (err) {
        console.error('Error deleting contact information:', err);
        setError('Failed to delete contact information.');
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact.id);
    setFormData({
      id: contact.id,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      tnx_number:contact.tnx_number
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading contact information...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tnx Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contactInfos.map(contact => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{contact.phone}</td>
                <td className="px-6 py-4">{contact.address || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{contact.tnx_number}</td>
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
        <UpdateContactInfo
          formData={formData}
          setFormData={setFormData}
          onUpdate={() => {
            setContactInfos(prev =>
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

export default ViewContactInfo;