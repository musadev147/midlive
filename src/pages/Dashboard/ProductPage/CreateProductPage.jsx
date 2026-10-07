import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateProductPage = ({ onProductPageCreated }) => {
  const [formData, setFormData] = useState({
    headline: "",
    paragraph: "",

  });
  const [error, setError] = useState(null);
  const [pageExists, setPageExists] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const checkProductPageExists = async () => {
      try {
        const response = await axios.get(`${apiUrl}/productpages`);
        if (response.data.length > 0) {
          if (!pageExists) { // Only show alert and redirect once
            setPageExists(true);
            alert("Product Page Already Exist!");
            onProductPageCreated(); // Redirect
          }
        }
      } catch (err) {
        setError("An error occurred while checking the product page.");
      }
    };

    checkProductPageExists();
  }, [apiUrl, pageExists, onProductPageCreated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/productpages`, formData);
      alert("Product Page Created Successfully!");
      onProductPageCreated();
    } catch (err) {
      setError("An error occurred while creating the product page.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Set Homepage/Product Page</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Headline</label>
          <input
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Paragraph</label>
          <input
            name="paragraph"
            value={formData.paragraph}
            onChange={handleChange}
            className="border w-full p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Charge
        </button>
      </form>
    </div>
  );
};

export default CreateProductPage;
