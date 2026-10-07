import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateColor = ({ onColorCreated }) => {
  const [formData, setFormData] = useState({
    product_id: "",
    color: "",
    image: null,
  });

  const [error, setError] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/products`);
        setProducts(response.data); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
  }, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });


    try {
      await axios.post(`${apiUrl}/colors`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Color Section Created Successfully!");
      onColorCreated(); // Callback to refresh or update the page
    } catch (err) {
      setError("An error occurred while creating the live section.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Color Section</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Product Name</label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            className="border w-full p-2"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Color Name</label>
          <input
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleChange} // Only handle the file selection
            className="border w-full p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Color Section
        </button>
      </form>
    </div>
  );
};

export default CreateColor;
