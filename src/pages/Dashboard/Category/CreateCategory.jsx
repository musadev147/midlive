import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreateCategory = ({ onCategoryCreated }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    image: null,
    sort_order: 0,
    product_limit: 10,
    parent_id: "",
    show_on_homepage: false
  });
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageCompressionOptions = {
     maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.9,
    fileType: 'image/webp'
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/category`);
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      // Convert empty string to null for parent_id
      const processedValue = name === 'parent_id' && value === '' ? null : value;
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handleCategoryImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBlob = await imageCompression(file, imageCompressionOptions);
      const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      const compressedFile = new File([compressedBlob], fileName, {
        type: "image/webp",
        lastModified: Date.now()
      });

      setFormData(prev => ({ 
        ...prev, 
        image: compressedFile 
      }));
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to compress image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation checks
      const isCategoryExists = categories.some(
        cat => cat.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isCategoryExists) {
        throw new Error("A category with this name already exists!");
      }

      if (!formData.image) {
        throw new Error("Please select an image");
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("image", formData.image);
      data.append("sort_order", formData.sort_order.toString());
      data.append("product_limit", formData.product_limit.toString());
      
      // Handle parent_id - send null if empty
      if (formData.parent_id) {
        data.append("parent_id", formData.parent_id.toString());
      } else {
        data.append("parent_id", "");
      }
      
      // Convert boolean to integer (0 or 1) for MySQL
      data.append("show_on_homepage", formData.show_on_homepage ? "1" : "0");

      const response = await axios.post(`${apiUrl}/category`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      if (response.data && response.data.success) {
        alert("Category created successfully!");
        setFormData({ 
          name: "", 
          image: null,
          sort_order: 0,
          product_limit: 10,
          parent_id: "",
          show_on_homepage: false
        });
        if (onCategoryCreated) onCategoryCreated();
      } else {
        throw new Error(response.data?.message || "Failed to create category");
      }
    } catch (err) {
      console.error("Error creating category:", err);
      
      if (err.response) {
        console.error("Server response:", err.response.data);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Category</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Category Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Parent Category</label>
          <select
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Parent</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Sort Order</label>
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            placeholder="Sort order"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Product Limit</label>
          <input
            type="number"
            name="product_limit"
            value={formData.product_limit}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            placeholder="Number of products to show"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="show_on_homepage"
            checked={formData.show_on_homepage}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            id="show_on_homepage"
          />
          <label htmlFor="show_on_homepage" className="ml-2 block text-gray-700">
            Show on Homepage
          </label>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Category Image*</label>
          <input
            type="file"
            name="image"
            onChange={handleCategoryImageChange}
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {formData.image && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {formData.image.name} ({(formData.image.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;