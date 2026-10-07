import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const flattenCategories = (categories = [], depth = 0) =>
  categories.flatMap((category) => {
    const labelPrefix = depth > 0 ? `${"— ".repeat(depth)}` : "";
    return [
      {
        ...category,
        label: `${labelPrefix}${category.name}`,
      },
      ...flattenCategories(category.children || [], depth + 1),
    ];
  });

const CreateMenu = ({ onMenuCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    menu_type: "header",
    order: 1,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${apiUrl}/category`);
        const categoryList = Array.isArray(response.data?.categories)
          ? response.data.categories
          : [];
        setCategories(flattenCategories(categoryList));
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/menus`, {
        ...formData,
        category_id: formData.category_id || null,
      });
      alert("Menu Created Successfully!");
      onMenuCreated?.();
      setFormData({
        name: "",
        category_id: "",
        menu_type: "header",
        order: 1,
      });
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setError("An error occurred while creating the Menu.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Menu</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a category and set the menu label for the header or homepage sections.
        </p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Custom Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
            required
            maxLength="255"
            placeholder="e.g., Doctors Appointment"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
            required
            disabled={loadingCategories}
          >
            <option value="">{loadingCategories ? "Loading categories..." : "Select a category"}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Menu Type</label>
          <select
            name="menu_type"
            value={formData.menu_type}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
            required
          >
            <option value="header">Header</option>
            <option value="home_page">Home Page</option>
            <option value="footer">Footer</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Sort Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white transition hover:from-green-600 hover:to-emerald-700"
        >
          Create Menu
        </button>
      </form>
    </div>
  );
};

export default CreateMenu;
