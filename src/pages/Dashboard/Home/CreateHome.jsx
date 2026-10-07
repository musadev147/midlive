import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const apiUrl = config.apiUrl;

const CreateHome = ({ onHomeCreated }) => {
  const [formData, setFormData] = useState({
    slug: "",
    headline: "",
    paragraph: "",
    description: "",
  });

  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({
      ...prev, 
      description: value || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/homepages`, formData);
      alert("Landing page created successfully!");
      if (onHomeCreated) onHomeCreated();
      // Reset form after successful submission
      setFormData({
        slug: "",
        headline: "",
        paragraph: "",
        description: "",
      });
    } catch (err) {
      console.error("Error creating landing page:", err);
      setError(err.response?.data?.message || "An error occurred while creating the landing page.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Landing Page</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Select Product*</label>
            <select
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a product</option>
              {products.length > 0 ? (
                products.map(product => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))
              ) : (
                <option disabled>No products available</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Headline*</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter headline text"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Paragraph</label>
            <textarea
              name="paragraph"
              value={formData.paragraph}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder="Enter paragraph text"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Description</label>
            <ReactQuill
              value={formData.description}
              onChange={handleQuillChange}
              className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              formats={[
                'header',
                'bold', 'italic', 'underline', 'strike',
                'list', 'bullet',
                'link', 'image'
              ]}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Landing Page'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateHome;