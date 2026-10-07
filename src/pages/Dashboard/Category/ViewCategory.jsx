import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateCategory from "./UpdateCategory";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    image: null,
    sort_order: 0,
    product_limit: 10,
    parent_id: "",
    show_on_homepage: false
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const imageCompressionOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1080,
    useWebWorker: true,
    fileType: "image/webp"
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/category`);
        setCategories(response.data.categories || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${apiUrl}/categorydelete/${id}`);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category");
      }
    }
  };

  const handleEditClick = (cat) => {
    setEditingCat(cat.id);
    setFormData({ 
      name: cat.name,
      image: null,
      sort_order: cat.sort_order,
      product_limit: cat.product_limit,
      parent_id: cat.parent_id || "",
      show_on_homepage: cat.show_on_homepage
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  const handleImageChange = async (e) => {
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
      setError(null);
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to compress image. Please try another image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingCat) {
      setError("No category selected for editing");
      return;
    }

    const data = new FormData();
    data.append("_method", "PUT");
    data.append("name", formData.name);
    data.append("sort_order", formData.sort_order.toString());
    data.append("product_limit", formData.product_limit.toString());
    
    // Handle parent_id - send empty string if null
    if (formData.parent_id) {
      data.append("parent_id", formData.parent_id.toString());
    } else {
      data.append("parent_id", "");
    }
    
    // Convert boolean to integer (1 or 0) for MySQL
    data.append("show_on_homepage", formData.show_on_homepage ? "1" : "0");
    
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await axios.post(`${apiUrl}/categoryupdate/${editingCat}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      alert("Category updated successfully");
      setRefreshKey(prev => prev + 1);
      setEditingCat(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Homepage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cat.name}
                  {cat.parent_id && (
                    <span className="text-xs text-gray-500 block">Child of: {
                      categories.find(c => c.id === cat.parent_id)?.name || 'Unknown'
                    }</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{cat.sort_order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cat.show_on_homepage ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="h-16 w-16 object-cover rounded"
                    loading="lazy"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditClick(cat)}
                    className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCat && (
        <UpdateCategory
          formData={formData}
          handleImageChange={handleImageChange}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingCat(null)}
          loading={loading}
          error={error}
          categories={categories}
          editingCat={editingCat} 
        />
      )}
    </div>
  );
};

export default ViewCategory;