import React from 'react';

const UpdateMenu = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  onCancel,
  loading, 
  error,
  categories = [],
  loadingCategories = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-2">Edit Menu</h2>
        <p className="mb-5 text-sm text-gray-500">
          Change the visible menu name or reassign it to another category or homepage section.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Custom Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
              required
              maxLength="255"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category_id"
              value={formData.category_id || ""}
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold text-white hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMenu;
