import React from "react";

const UpdateCategory = ({ 
  formData, 
  handleImageChange,
  handleChange, 
  handleSubmit, 
  onCancel,
  loading, 
  error,
  categories,
  editingCat
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Update Category</h2>
        
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
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Parent Category</label>
            <select
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Parent</option>
              {categories.filter(cat => cat.id !== editingCat).map(category => (
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
            <label className="block text-gray-700 mb-1">Update Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.image && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {formData.image.name} (
                {(formData.image.size / 1024).toFixed(2)} KB)
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Image will be compressed to WebP format (max 0.5MB)
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCategory;