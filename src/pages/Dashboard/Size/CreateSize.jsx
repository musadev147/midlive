import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import "react-quill/dist/quill.snow.css"; 

const apiUrl = config.apiUrl;

const CreateSize = ({ onSizeCreated }) => {
  const [formData, setFormData] = useState({
    color_id: "",
    size: "",
  });

  const [error, setError] = useState(null);
  const [colors, setColors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/colors`); // এপিআই থেকে ডেটা পেতে
        setColors(response.data); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching colors:", error);
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
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

  // এই ফাংশনটি ব্যবহার করে product খুঁজবেন color এর product_id এর ভিত্তিতে
  const getProductNameById = (productId) => {
    const foundProduct = products?.find((product) => product.id === productId);
    return foundProduct ? foundProduct.name : "Unknown Product";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${apiUrl}/sizes`, formData);
      alert("Size Created Successfully!");
      onSizeCreated();
    } catch (err) {
      setError("An error occurred while creating the Size You page.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Size</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Select Your Product</label>
          <select
            name="color_id"
            value={formData.color_id}
            onChange={handleChange}
            className="border w-full p-2"
            required
          >
            <option value="">Select Your Product</option>
            {colors &&
              colors.map((color) => (
                <option key={color.id} value={color.id}>
                  {getProductNameById(color.product_id)} - {color.color}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Size</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Size
        </button>
      </form>
    </div>
  );
};

export default CreateSize;
