import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Link } from "react-router-dom";
import UpdateSize from "./UpdateSize";

const apiUrl = config.apiUrl;

const ViewSize = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSize, setEditingSize] = useState(null);

  const [colors, setColors] = useState(null);
  const [products, setProducts] = useState(null);

  const [formData, setFormData] = useState({
    color_id: "",
    size: "",
  });

  // Fetch sizes (sizes) from API
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/sizes`);
        setSizes(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sizes:", err);
        setError("Failed to load sizes.");
        setLoading(false);
      }
    };

    fetchSizes();
  }, []);

  // Fetch colors from API
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/colors`);
        setColors(response.data);
      } catch (error) {
        console.error("Error fetching colors:", error);
      }
    };

    fetchColors();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to get product name by color_id
  const getProductNameByColorId = (colorId) => {
    const color = colors?.find((color) => color.id === colorId);
    const product = products?.find((product) => product.id === color?.product_id);
    return product ? product.name : "Unknown Product";
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${apiUrl}/sizedelete/${id}`);
        setSizes((prev) => prev.filter((size) => size.id !== id));
      } catch (err) {
        console.error("Error deleting entry:", err);
        setError("Failed to delete entry.");
      }
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (size) => {
    setEditingSize(size.id);
    setFormData({
      color_id: size.color_id,
      size: size.size,
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

    if (!editingSize) {
      setError("No entry selected for editing.");
      return;
    }

    try {
      await axios.put(`${apiUrl}/sizesupdate/${editingSize}`, formData);

      alert("Entry updated successfully");
      setSizes((prev) =>
        prev.map((size) =>
          size.id === editingSize ? { ...size, ...formData } : size
        )
      );
      setEditingSize(null); // Clear editing state
    } catch (err) {
      console.error("Error updating entry:", err);
      setError("Failed to update entry.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Sizes</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Product Name</th>
            <th className="border border-gray-300 px-4 py-2">Color Name</th>
            <th className="border border-gray-300 px-4 py-2">Size</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size.id}>
              <td className="border border-gray-300 px-4 py-2">
                {getProductNameByColorId(size.color_id)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {colors?.find((color) => color.id === size.color_id)?.color || "Unknown Color"}
              </td>
              <td className="border border-gray-300 px-4 py-2">{size.size}</td>
              <td className="flex flex-col gap-2 border border-gray-300 px-4 py-2">
                {/* <button
                  onClick={() => handleEditClick(size)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 mr-2"
                >
                  Edit
                </button> */}
                <button
                  onClick={() => handleDelete(size.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingSize && (
        <UpdateSize
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

export default ViewSize;
