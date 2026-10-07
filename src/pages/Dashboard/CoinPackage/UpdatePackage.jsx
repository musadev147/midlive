import React from "react";


const UpdatePackage = ({ 
  formData, 
  setFormData,
  handleChange,
  handleSubmit, 
  onCancel,
  loading, 
  error,
  setError
}) => {
 

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Update Package</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name Of Package</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="255"
            placeholder="Eid Special"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Package Coins</label>
          <input
            name="coins"
            value={formData.coins}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="Enter Coins"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Package Price</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength="20"
            placeholder="Enter Amount"
          />
        </div>

        <div className="flex items-center mb-4">
        <label className="text-gray-700">Is Active</label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="mr-2"
          />
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
              {loading ? 'Updating...' : 'Update Bonus Coin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePackage;