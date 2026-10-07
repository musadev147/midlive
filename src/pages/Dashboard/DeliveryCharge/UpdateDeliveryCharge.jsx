import React from "react";

const UpdateDeliveryCharge = ({ formData, handleChange, handleSubmit, loading, error, onCancel }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div onClick={onCancel} className="flex justify-end cursor-pointer">Close</div>
      <h2 className="text-2xl font-bold mb-4">Update Delivery Charge</h2>

      {loading && <p className="text-blue-500 mb-4">Updating...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* District Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">District Name</label>
          <input
            name="district_name"
            value={formData.district_name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            placeholder="e.g. মাদারীপুরের ভেতরে"
          />
        </div>

        {/* Delivery Charge */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Delivery Charge (৳)</label>
          <input
            type="number"
            name="delivery_charge"
            value={formData.delivery_charge}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            placeholder="e.g. 50"
          />
        </div>

        {/* Estimated Days */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Estimated Delivery Days</label>
          <input
            type="number"
            name="estimated_days"
            value={formData.estimated_days}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            placeholder="e.g. 2"
          />
        </div>

        {/* Delivery Note */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Delivery Note</label>
          <textarea
            name="delivery_note"
            value={formData.delivery_note}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows="3"
            placeholder="e.g. 50 Taka Delivery Charge"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Delivery Charge"}
        </button>
      </form>
    </div>
  );
};

export default UpdateDeliveryCharge;