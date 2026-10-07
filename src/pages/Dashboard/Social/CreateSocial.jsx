import React, { useState } from "react";
import axios from "axios";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const CreateSocial = ({ onSocialCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    icon_class: "",
    url: "",
    status: true, // default to active
  });
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/sociallinks`, formData);
      alert("Social Link Created Successfully!");
      onSocialCreated();
    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      setError("An error occurred while creating the Social Link.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Social Link</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Platform Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            maxLength="255"
            placeholder="e.g. Facebook, Twitter"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Icon Class</label>
          <input
            name="icon_class"
            value={formData.icon_class}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            maxLength="255"
            placeholder="e.g. FaFacebook"
          />
          <p className="text-sm text-gray-500 mt-1">Use this icon library classes: FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaGithub, FaTelegram, FaGlobe, FaLinkedin, FaPinterest, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaThreads, FaSoundcloud, FaSnapchat, FaTiktok, FaReddit, FaTumblr, FaVimeo, FaFlickr, FaBehance, FaDribbble, FaDiscord, FaSlack, FaSpotify, FaMedium, FaQuora, FaWeibo, FaWeChat, FaQQ, FaXing, FaMastodon, FaClubhouse, FaEllo, FaBlogger, FaTypeform, FaSurveyMonkey, FaMailchimp, FaKickstarter, FaPatreon, FaSubstack</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Profile URL</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            maxLength="500"
            placeholder="https://example.com/profile"
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="status" className="text-gray-700">
            Active
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Social Link
        </button>
      </form>
    </div>
  );
};

export default CreateSocial;