import React from 'react';

const UpdateSocial = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  onCancel,
  loading, 
  error 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Social Link</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Platform Name</label>
            <input
              type="text"
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
            <label className="block text-gray-700 mb-2">Icon Class</label>
            <div className="flex items-center">
              {formData.icon_class && (
                <i className={`${formData.icon_class} mr-2 text-xl`}></i>
              )}
              <input
                type="text"
                name="icon_class"
                value={formData.icon_class}
                onChange={handleChange}
                className="border w-full p-2 rounded"
                required
                maxLength="255"
                placeholder="e.g. fab fa-facebook"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Use this icon library classes: FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaGithub, FaTelegram, FaGlobe, FaLinkedin, FaPinterest, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope, FaThreads, FaSoundcloud, FaSnapchat, FaTiktok, FaReddit, FaTumblr, FaVimeo, FaFlickr, FaBehance, FaDribbble, FaDiscord, FaSlack, FaSpotify, FaMedium, FaQuora, FaWeibo, FaWeChat, FaQQ, FaXing, FaMastodon, FaClubhouse, FaEllo, FaBlogger, FaTypeform, FaSurveyMonkey, FaMailchimp, FaKickstarter, FaPatreon, FaSubstack</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Profile URL</label>
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Social Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSocial;