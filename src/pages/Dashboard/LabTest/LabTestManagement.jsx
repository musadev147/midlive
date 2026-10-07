import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaVial,
} from "react-icons/fa";
import { config } from "../../../config";

const iconOptions = [
  "MdBloodtype",
  "FaHeartbeat",
  "FaTint",
  "FaMicroscope",
  "FaVial",
  "FaSyringe",
  "FaFlask",
  "MdScience",
  "MdBiotech",
];

const LabTestManagement = () => {
  const [labTests, setLabTests] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const API_URL = `${config.apiUrl}/lab-tests`;

  const defaultFormData = {
    name: "",
    description: "",
    image: null,
    image_preview: "",
    icon: "MdBloodtype",
    original_price: "",
    discounted_price: "",
    discount: "",
    report_time: "",
    booking_count: "",
    rating: "",
    labs: [
      {
        name: "",
        logo: null,
        logo_preview: "",
        original_price: "",
        discounted_price: "",
        rating: "",
        is_recommended: false,
      },
    ],
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchLabTests = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(API_URL);
      setLabTests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      alert("Failed to fetch lab tests");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingTest(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      name: test?.name || "",
      description: test?.description || "",
      image: null,
      image_preview: test?.image_url || test?.image || "",
      icon: test?.icon || "MdBloodtype",
      original_price: test?.original_price || "",
      discounted_price: test?.discounted_price || "",
      discount: test?.discount || "",
      report_time: test?.report_time || "",
      booking_count: test?.booking_count || "",
      rating: test?.rating || "",
      labs:
        test?.labs?.length > 0
          ? test.labs.map((lab) => ({
            id: lab.id,
            name: lab.name || "",
            logo: null,
            logo_preview: lab.logo_url || lab.logo || "",
            original_price: lab.original_price || "",
            discounted_price: lab.discounted_price || "",
            rating: lab.rating || "",
            is_recommended: !!lab.is_recommended,
          }))
          : [
            {
              name: "",
              logo: null,
              logo_preview: "",
              original_price: "",
              discounted_price: "",
              rating: "",
              is_recommended: false,
            },
          ],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lab test?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Lab test deleted successfully");
      fetchLabTests();
    } catch (error) {
      console.error("Error deleting lab test:", error);
      alert("Failed to delete lab test");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
      image_preview: file ? URL.createObjectURL(file) : prev.image_preview,
    }));
  };

  const handleLabChange = (index, field, value) => {
    const updatedLabs = [...formData.labs];
    updatedLabs[index] = {
      ...updatedLabs[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      labs: updatedLabs,
    }));
  };

  const handleLabLogoChange = (index, e) => {
    const file = e.target.files?.[0] || null;
    const updatedLabs = [...formData.labs];

    updatedLabs[index] = {
      ...updatedLabs[index],
      logo: file,
      logo_preview: file
        ? URL.createObjectURL(file)
        : updatedLabs[index].logo_preview,
    };

    setFormData((prev) => ({
      ...prev,
      labs: updatedLabs,
    }));
  };

  const addLabRow = () => {
    setFormData((prev) => ({
      ...prev,
      labs: [
        ...prev.labs,
        {
          name: "",
          logo: null,
          logo_preview: "",
          original_price: "",
          discounted_price: "",
          rating: "",
          is_recommended: false,
        },
      ],
    }));
  };

  const removeLabRow = (index) => {
    const updatedLabs = [...formData.labs];
    updatedLabs.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      labs:
        updatedLabs.length > 0
          ? updatedLabs
          : [
            {
              name: "",
              logo: null,
              logo_preview: "",
              original_price: "",
              discounted_price: "",
              rating: "",
              is_recommended: false,
            },
          ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description || "");
      payload.append("icon", formData.icon || "MdBloodtype");
      payload.append("original_price", formData.original_price || 0);
      payload.append("discounted_price", formData.discounted_price || 0);
      payload.append("discount", formData.discount || "");
      payload.append("report_time", formData.report_time || "");
      payload.append("booking_count", formData.booking_count || "");
      payload.append("rating", formData.rating || 0);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      formData.labs.forEach((lab, index) => {
        payload.append(`labs[${index}][name]`, lab.name || "");
        payload.append(`labs[${index}][original_price]`, lab.original_price || 0);
        payload.append(
          `labs[${index}][discounted_price]`,
          lab.discounted_price || 0
        );
        payload.append(`labs[${index}][rating]`, lab.rating || 0);
        payload.append(
          `labs[${index}][is_recommended]`,
          lab.is_recommended ? 1 : 0
        );

        if (lab.logo) {
          payload.append(`labs[${index}][logo]`, lab.logo);
        }
      });

      if (editingTest) {
        payload.append("_method", "PUT");
        await axios.post(`${API_URL}/${editingTest.id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Lab test updated successfully");
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Lab test created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchLabTests();
    } catch (error) {
      console.error("Error saving lab test:", error);
      alert(error?.response?.data?.message || "Failed to save lab test");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gray-800 bg-clip-text text-3xl font-bold text-transparent">
              Lab Test Management
            </h1>
            <p className="mt-2 text-gray-600">
              Create, update and delete lab tests with image, logo and icon
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-gray-800 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <FaPlus />
            Create Lab Test
          </button>
        </div>

        {pageLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : labTests.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <p className="text-lg font-semibold text-gray-700">
              No lab tests found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {labTests.map((test) => (
              <div
                key={test.id}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                {/* HEADER */}
                <div className="border-b bg-gray-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {test.description || "No description"}
                      </p>
                    </div>

                    {/* ICON */}
                    <div className="rounded-xl bg-gray-900 p-2 text-white">
                      <FaVial size={16} />
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="space-y-3 p-5">

                  {/* IMAGE */}
                  {test.image_url || test.image ? (
                    <img
                      src={test.image_url || test.image}
                      alt={test.name}
                      className="h-40 w-full rounded-xl border object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl border bg-gray-50 text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* PRICES */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Original Price</span>
                    <span className="font-medium text-gray-800">
                      ৳{test.original_price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discounted Price</span>
                    <span className="font-semibold text-emerald-600">
                      ৳{test.discounted_price}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={() => handleEdit(test)}
                      className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      <FaEdit className="inline mr-1" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(test.id)}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <FaTrash className="inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
                <h2 className="text-lg font-bold text-gray-800 sm:text-2xl">
                  {editingTest ? "Update Lab Test" : "Create Lab Test"}
                </h2>

                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                  <FaTimes />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6 space-y-6 sm:space-y-8"
              >

                {/* ================= TEST INFO ================= */}
                <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-gray-800 sm:text-lg">
                    Test Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* NAME */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">
                        Test Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:bg-white"
                        required
                      />
                    </div>

                    {/* ICON */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-600">
                        Icon *
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:bg-white"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <textarea
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:bg-white"
                      />
                    </div>

                    {/* ================= MODERN IMAGE UPLOAD ================= */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-gray-600">
                        Test Image
                      </label>

                      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:border-gray-400">

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTestImageChange}
                          className="hidden"
                          id="testImageUpload"
                        />

                        <label
                          htmlFor="testImageUpload"
                          className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
                        >
                          <div className="rounded-full bg-gray-900 p-3 text-white">
                            📁
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 2MB
                          </p>
                        </label>

                        {formData.image_preview && (
                          <div className="mt-4 flex justify-center">
                            <img
                              src={formData.image_preview}
                              className="h-28 w-28 rounded-xl border object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PRICING FIELDS */}
                    {[
                      ["Original Price *", "original_price"],
                      ["Discounted Price *", "discounted_price"],
                      ["Discount", "discount"],
                      ["Report Time", "report_time"],
                      ["Booking Count", "booking_count"],
                      ["Rating", "rating"],
                    ].map(([label, name]) => (
                      <div key={name}>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                          {label}
                        </label>
                        <input
                          type={name === "rating" ? "number" : "text"}
                          step={name === "rating" ? "0.1" : undefined}
                          name={name}
                          value={formData[name]}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-800 focus:bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= LABS ================= */}
                <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-800 sm:text-lg">
                      Labs
                    </h3>

                    <button
                      type="button"
                      onClick={addLabRow}
                      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      <FaPlus className="inline mr-1" />
                      Add Lab
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.labs.map((lab, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border bg-gray-50 p-4"
                      >

                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Lab #{index + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeLabRow(index)}
                            className="text-sm font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          {/* LAB NAME */}
                          <input
                            placeholder="Lab Name"
                            value={lab.name}
                            onChange={(e) =>
                              handleLabChange(index, "name", e.target.value)
                            }
                            className="rounded-xl border bg-white px-4 py-2.5 text-sm"
                          />

                          {/* MODERN LOGO UPLOAD */}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLabLogoChange(index, e)}
                              className="hidden"
                              id={`labLogo-${index}`}
                            />

                            <label
                              htmlFor={`labLogo-${index}`}
                              className="flex cursor-pointer items-center justify-center rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                              📤 Upload Logo
                            </label>

                            {lab.logo_preview && (
                              <div className="mt-3 flex justify-center">
                                <img
                                  src={lab.logo_preview}
                                  className="h-16 w-16 rounded-lg border object-cover"
                                />
                              </div>
                            )}
                          </div>

                          {/* PRICES */}
                          <input
                            type="number"
                            placeholder="Original Price"
                            value={lab.original_price}
                            onChange={(e) =>
                              handleLabChange(index, "original_price", e.target.value)
                            }
                            className="rounded-xl border bg-white px-4 py-2.5 text-sm"
                          />

                          <input
                            type="number"
                            placeholder="Discounted Price"
                            value={lab.discounted_price}
                            onChange={(e) =>
                              handleLabChange(index, "discounted_price", e.target.value)
                            }
                            className="rounded-xl border bg-white px-4 py-2.5 text-sm"
                          />

                          {/* RATING */}
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Rating"
                            value={lab.rating}
                            onChange={(e) =>
                              handleLabChange(index, "rating", e.target.value)
                            }
                            className="rounded-xl border bg-white px-4 py-2.5 text-sm"
                          />

                          {/* CHECKBOX */}
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={lab.is_recommended}
                              onChange={(e) =>
                                handleLabChange(index, "is_recommended", e.target.checked)
                              }
                            />
                            Recommended
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="sticky bottom-0 flex flex-col gap-3 border-t bg-white p-3 sm:flex-row sm:p-4">

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                  >
                    <FaSave />
                    {submitLoading
                      ? "Saving..."
                      : editingTest
                        ? "Update Lab Test"
                        : "Create Lab Test"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
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

export default LabTestManagement;