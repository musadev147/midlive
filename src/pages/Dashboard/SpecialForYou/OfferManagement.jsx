import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSave
} from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import { config } from '../../../config';
import { buildImageUrl, handleImageFallback } from '../../../utils/image';
import {
  buildOfferButtonStyle,
  buildOfferCardStyle,
  buildOfferCircleStyle,
  sortOffers
} from '../../../utils/offerTheme';

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    subtext: '',
    button_text: '',
    button_link: '',
    image: null,
    previewUrl: null,
    card_color: '#10ADBE',
    sort_order: ''
  });

  const apiUrl = config.apiUrl;
  const API_URL = `${apiUrl}/offers`;

  // Fetch all offers
  const fetchOffers = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get(API_URL);
      const data = Array.isArray(response.data) ? response.data : [];
      setOffers(sortOffers(data));
    } catch (error) {
      console.error('Error fetching offers:', error);
      alert('Failed to fetch offers');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBlob = await imageCompression(file, {
        maxSizeMB: 1.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.9,
        fileType: 'image/webp'
      });

      const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
      const compressedFile = new File([compressedBlob], fileName, {
        type: 'image/webp',
        lastModified: Date.now()
      });

      setFormData((prev) => ({
        ...prev,
        image: compressedFile,
        previewUrl: URL.createObjectURL(compressedFile)
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      discount: '',
      subtext: '',
      button_text: '',
      button_link: '',
      image: null,
      previewUrl: null,
      card_color: '#10ADBE',
      sort_order: ''
    });
    setEditingOffer(null);
  };

  // Create
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Edit
  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer?.top_text || offer?.title || '',
      discount: offer?.main_text || offer?.discount || '',
      subtext: offer?.support_text || offer?.subtext || '',
      button_text: offer?.button_text || '',
      button_link: offer?.button_link || '',
      image: null,
      previewUrl: offer?.image || null,
      card_color: offer?.card_color || '#10ADBE',
      sort_order: offer?.sort_order ?? ''
    });
    setShowModal(true);
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('discount', formData.discount);
      payload.append('subtext', formData.subtext || '');
      payload.append('top_text', formData.title);
      payload.append('main_text', formData.discount);
      payload.append('support_text', formData.subtext || '');
      payload.append('button_text', formData.button_text);
      payload.append('button_link', formData.button_link || '');
      payload.append('card_color', formData.card_color || '');
      payload.append('sort_order', formData.sort_order === '' ? '9999' : String(Number(formData.sort_order)));

      if (formData.image) {
        payload.append('image', formData.image);
      }

      if (editingOffer) {
        payload.append('_method', 'PUT');
        await axios.post(`${API_URL}/${editingOffer.id}`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Offer updated successfully');
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Offer created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Failed to save offer');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this offer?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
              Offer Management
            </h1>
            <p className="mt-2 text-gray-600">
              Create, edit and manage your offer cards
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <FaPlus />
            Add Offer
          </button>
        </div>

        {/* Offers Grid */}
        {pageLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <p className="text-lg font-semibold text-gray-700">
              No offers found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Click "Add Offer" to add your first offer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="group relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className="relative overflow-hidden rounded-2xl p-5 shadow-lg"
                  style={buildOfferCardStyle(offer, index)}
                >
                  {/* Action Buttons */}
                  <div className="absolute left-4 top-4 z-20 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-blue-50"
                    >
                      <FaEdit className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-red-50"
                    >
                      <FaTrash className="h-4 w-4 text-red-600" />
                    </button>
                  </div>

                  <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white opacity-5"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-24 w-24 rounded-full bg-white opacity-5"></div>

                  <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                    <div className="pr-14">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                      {offer?.top_text || offer?.title || 'Offer'}
                      </p>

                      <h3 className="mb-2 text-3xl font-extrabold text-white">
                        {offer?.main_text || offer?.discount || 'N/A'}
                      </h3>

                      {offer?.support_text || offer?.subtext ? (
                        <p className="text-sm font-medium text-white/85">
                          {offer.support_text || offer.subtext}
                        </p>
                      ) : (
                        <div className="h-5" />
                      )}
                    </div>

                    <div className="w-full">
                      <button
                        className="w-full rounded-lg bg-white px-4 py-2.5 font-semibold shadow-md transition-all hover:shadow-xl"
                        style={buildOfferButtonStyle(offer, index)}
                      >
                        {offer?.button_text || 'Learn More'}
                      </button>
                    </div>
                  </div>

                  <div className="absolute right-3 top-3 z-20">
                    <div
                      className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white/70 bg-white shadow-md"
                      style={buildOfferCircleStyle(offer, index)}
                    >
                      <img
                        src={buildImageUrl(config.apiUrl.replace(/\/api\/?$/, ''), offer?.image)}
                        alt={offer?.top_text || offer?.title || 'Offer'}
                        className="h-full w-full object-cover"
                        onError={handleImageFallback}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingOffer ? 'Edit Offer' : 'Add Offer'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Offer Image *
                    </label>
                    <div className="flex flex-col gap-4">
                      {formData.previewUrl ? (
                        <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                          <img
                            src={formData.previewUrl}
                            alt="Offer preview"
                            className="h-56 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: null, previewUrl: null }))}
                            className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-500 shadow-md"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center transition-colors hover:bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mt-2 text-sm font-semibold text-gray-700">Click to upload an image</p>
                            <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            required={!editingOffer}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Card Color
                    </label>
                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-12 w-12 rounded-xl border border-white shadow-sm"
                          style={{ backgroundColor: formData.card_color || '#10ADBE' }}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Choose the card accent color
                          </p>
                          <p className="text-xs text-gray-500">
                            This color will appear in the Especially For You section.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="card_color"
                          value={formData.card_color}
                          onChange={handleInputChange}
                          className="h-12 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                          aria-label="Card color picker"
                        />
                        <input
                          type="text"
                          name="card_color"
                          value={formData.card_color}
                          onChange={handleInputChange}
                          className="w-32 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="#10ADBE"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Top Text *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Order, UPTO"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Main Text *
                    </label>
                    <input
                      type="text"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 20% OFF, ৳100 OFF"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Support Text
                    </label>
                    <input
                      type="text"
                      name="subtext"
                      value={formData.subtext}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., + Extra 5% Cashback"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Button Text *
                    </label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Call Now, Order Now"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Button Link
                    </label>
                    <input
                      type="text"
                      name="button_link"
                      value={formData.button_link}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., https://example.com or prescription"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Lower numbers appear first"
                      min="0"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    <FaSave />
                    {submitLoading
                      ? 'Saving...'
                      : editingOffer
                      ? 'Update Offer'
                      : 'Save Offer'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferManagement;
