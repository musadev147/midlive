import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateColor from "./UpdateColor";
import { Link } from "react-router-dom";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewColor = () => {
  const [lives, setLives] = useState([]);
  const [video, setVideo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLive, setEditingLive] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Upload progress state

  const [products, setProducts] = useState([]); 

  const [formData, setFormData] = useState({
    product_id: "",
    color: "",
    image: null,
  });



  // Fetch lives from API
  useEffect(() => {
    const fetchLives = async () => {
      try {
        const response = await axios.get(`${apiUrl}/colors`);
        setLives(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lives:", err);
        setError("Failed to load live entries.");
        setLoading(false);
      }
    };

    fetchLives();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/products`); // এপিআই থেকে ডেটা পেতে
        setProducts(response.data); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
  }, []);


  const getProductNameById = (productId) => {
    const foundProduct = products?.find((product) => product.id === productId);
    return foundProduct ? foundProduct.name : "Unknown Product";
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this live entry?")) {
      try {
        await axios.delete(`${apiUrl}/colordelete/${id}`);
        setLives((prev) => prev.filter((live) => live.id !== id));
      } catch (err) {
        console.error("Error deleting live entry:", err);
        setError("Failed to delete live entry.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (live) => {
    setEditingLive(live.id);
    setFormData({
      product_id: live.product_id,
      color: live.color,
      image: live.image
    });
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Form Submit with Progress Tracking
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingLive) {
      setError("No live entry selected for editing.");
      return;
    }

    const data = new FormData();
    data.append("_method", "PUT");
    data.append("product_id", formData.product_id);
    data.append("image", formData.image);
    data.append("color", formData.color);

    try {
      await axios.post(`${apiUrl}/livesupdate/${editingLive}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress); // Update upload progress
        },
      });

      alert("Live entry updated successfully");
      setLives((prev) =>
        prev.map((live) =>
          live.id === editingLive ? { ...live, ...formData } : live
        )
      );
      setEditingLive(null); // Clear editing state
      setUploadProgress(0); // Reset upload progress
    } catch (err) {
      console.error("Error updating live entry:", err);
      setError("Failed to update live entry.");
      setUploadProgress(0); // Reset upload progress on error
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Live Entries</h2>
      {error && <p className="text-red-500">{error}</p>}
      
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Product Name</th>
            <th className="border border-gray-300 px-4 py-2">Color</th>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lives.map((live) => (
            <tr key={live.id}>
              <td className="border border-gray-300 px-4 py-2">{getProductNameById(live.product_id)}</td>
              <td className="border border-gray-300 px-4 py-2">{live.color}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img src={`${imageUrl}/${live.image}`} alt="" width={100} />
              </td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                {/* <button
                  onClick={() => handleEditClick(live)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button> */}
                <button
                  onClick={() => handleDelete(live.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <Link to={`/live/${live.slug}`} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingLive && (
        <UpdateColor
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setVideo={setVideo}
          uploadProgress={uploadProgress}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default ViewColor;
