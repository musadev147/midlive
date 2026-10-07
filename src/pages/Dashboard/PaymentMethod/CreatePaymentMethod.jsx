import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import imageCompression from 'browser-image-compression';


const apiUrl = config.apiUrl;

const CreatePaymentMethod = ({ onPaymentCreated }) => {
  const [formData, setFormData] = useState({
    image: "",
    payment_method: "",
    payment_number: ""
  });
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

const [image, setImage] = useState(null);
const [compressedImage, setCompressedImage] = useState(null);
const [isCompressing, setIsCompressing] = useState(false);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/webp'
      };


 	const compressedBlob = await imageCompression(file, options);
      
    const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    const compressedFile = new File([compressedBlob], fileName, {
        type: "image/webp",
        lastModified: Date.now()
   });

      setCompressedImage(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setIsCompressing(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('image', compressedImage);
    data.append('payment_method', formData.payment_method);
    data.append('payment_number', formData.payment_number);
    
    try {
      await axios.post(`${apiUrl}/paymentmethod`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Payment Method Created Successfully!");
      onPaymentCreated();
      // Reset form after successful submission
      setFormData({
        image: "",
        payment_method: "",
        payment_number: ""
      });
      setImagePreview(null);
    } catch (err) {
      setError(err?.response?.data?.message);
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Add Payment Method</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          >
            <option value="">Select Payment Method</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Payment Number/Account</label>
          <input
            type="text"
            name="payment_number"
            value={formData.payment_number}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            placeholder="e.g. 017XXXXXXXX"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Payment Method Image (QR/Logo)</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="border w-full p-2 rounded"
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 object-contain border rounded"
              />
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Add Payment Method
        </button>
      </form>
    </div>
  );
};

export default CreatePaymentMethod;