import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import imageCompression from "browser-image-compression";

const apiUrl = config.apiUrl;

const CreateProduct = ({ onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    category_id: "",
    clothing: false,
    images: [],
    colors: [{ color: "", image: null, sizes: [{ size: "" }] }],
    bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
    bumps: [{ title: "", image: null, description: "" }],
    homepage: {
      headline: "",
      paragraph: "",
      description: ""
    },
    singleProductSizes: [{ size: "", quantity: 0 }]
  });

  const [error, setError] = useState(null);
  const [addColors, setAddColors] = useState(false);
  const [addOffer, setAddOffer] = useState(false);
  const [showHomepageFields, setShowHomepageFields] = useState(false);
  const [showBulkDiscounts, setShowBulkDiscounts] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBumps, setShowBumps] = useState(false);
  const [showSingleSizes, setShowSingleSizes] = useState(false);

  // Image compression options
  const imageCompressionOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.9,
    fileType: 'image/webp'
  };

// Handle single product size changes without quantity check
const handleSingleSizeChange = (index, e) => {
  const { name, value } = e.target;
  const singleProductSizes = [...formData.singleProductSizes];
  singleProductSizes[index][name] = value; // সরাসরি value সেট
  setFormData(prev => ({ ...prev, singleProductSizes }));
};


  // Add new single product size
  const addSingleSize = () => {
    setFormData(prev => ({
      ...prev,
      singleProductSizes: [...prev.singleProductSizes, { size: "" }],
    }));
  };

  // Remove single product size
  const removeSingleSize = (index) => {
    const singleProductSizes = [...formData.singleProductSizes];
    singleProductSizes.splice(index, 1);
    setFormData(prev => ({ ...prev, singleProductSizes }));
  };

  // Handle bump image change
  const handleBumpImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, imageCompressionOptions);
      
      const bumps = [...formData.bumps];
      bumps[index].image = compressedFile;
      setFormData(prev => ({ ...prev, bumps }));
    } catch (error) {
      console.error("Bump image compression error:", error);
      setError("Failed to compress bump image");
    }
  };

  // Handle bump text changes
  const handleBumpChange = (index, e) => {
    const { name, value } = e.target;
    const bumps = [...formData.bumps];
    bumps[index][name] = value;
    setFormData(prev => ({ ...prev, bumps }));
  };

  // Add new bump
  const addBump = () => {
    setFormData(prev => ({
      ...prev,
      bumps: [...prev.bumps, { bump_price:"", title: "", image: null, description: "" }],
    }));
  };

  // Remove bump
  const removeBump = (index) => {
    const bumps = [...formData.bumps];
    bumps.splice(index, 1);
    setFormData(prev => ({ ...prev, bumps }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHomepageChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [name]: value
      }
    }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        "description": value
      }
    }));
  };

  // Handle image compression
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          return await imageCompression(file, imageCompressionOptions);
        })
      );
      
      setFormData(prev => ({ ...prev, images: compressedFiles }));
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to compress images");
    }
  };

  // Handle color image compression
  const handleColorImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, imageCompressionOptions);
      
      const colors = [...formData.colors];
      colors[index].image = compressedFile;
      setFormData(prev => ({ ...prev, colors }));
    } catch (error) {
      console.error("Color image compression error:", error);
      setError("Failed to compress color image");
    }
  };

  const handleColorChange = (index, e) => {
    const { name, value } = e.target;
    const colors = [...formData.colors];
    colors[index][name] = value;
    setFormData(prev => ({ ...prev, colors }));
  };

  const handleSizeChange = (colorIndex, sizeIndex, e) => {
    const { value } = e.target;
    const colors = [...formData.colors];
    colors[colorIndex].sizes[sizeIndex].size = value;
    setFormData(prev => ({ ...prev, colors }));
  };

  // Handle bulk discount changes
  const handleBulkDiscountChange = (index, e) => {
    const { name, value } = e.target;
    const bulk_discounts = [...formData.bulk_discounts];
    bulk_discounts[index][name] = value;
    setFormData(prev => ({ ...prev, bulk_discounts }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color: "", image: null, sizes: [{ size: "" }] }],
    }));
  };

  const addSize = (colorIndex) => {
    const colors = [...formData.colors];
    colors[colorIndex].sizes.push({ size: "" });
    setFormData(prev => ({ ...prev, colors }));
  };

  const addBulkDiscount = () => {
    setFormData(prev => ({
      ...prev,
      bulk_discounts: [...prev.bulk_discounts, { title: "", offer_quantity: "", discount_percentage: "" }],
    }));
  };

  const removeBulkDiscount = (index) => {
    const bulk_discounts = [...formData.bulk_discounts];
    bulk_discounts.splice(index, 1);
    setFormData(prev => ({ ...prev, bulk_discounts }));
  };

  const handleCheckedColor = () => {
    setAddColors(!addColors);
    setFormData(prev => ({ ...prev, clothing: !addColors }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/category`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("discount_price", formData.discount_price || "");
    data.append("category_id", formData.category_id);
    data.append("clothing", formData.clothing ? "1" : "0");

    // Add homepage data if enabled
    if (showHomepageFields) {
      data.append("homepage[headline]", formData.homepage.headline);
      data.append("homepage[paragraph]", formData.homepage.paragraph);
      data.append("homepage[description]", formData.homepage.description);
    }

    // Add bulk discounts if enabled
    if (showBulkDiscounts && formData.bulk_discounts.length > 0) {
      formData.bulk_discounts.forEach((discount, index) => {
        if (discount.title && discount.offer_quantity && discount.discount_percentage) {
          data.append(`bulk_discounts[${index}][title]`, discount.title);
          data.append(`bulk_discounts[${index}][offer_quantity]`, discount.offer_quantity);
          data.append(`bulk_discounts[${index}][discount_percentage]`, discount.discount_percentage);
        }
      });
    }

    // Add bumps if enabled
    if (showBumps && formData.bumps.length > 0) {
      formData.bumps.forEach((bump, index) => {
        if (bump.bump_price && bump.title && bump.description) {
          data.append(`bumps[${index}][bump_price]`, bump.bump_price);
          data.append(`bumps[${index}][title]`, bump.title);
          data.append(`bumps[${index}][description]`, bump.description);
          if (bump.image) {
            data.append(`bumps[${index}][image]`, bump.image);
          }
        }
      });
    }


    // Add single product sizes if enabled
    if (showSingleSizes && formData.singleProductSizes.length > 0) {
      formData.singleProductSizes.forEach((size, index) => {
        if (size.size) {
          data.append(`singleProductSizes[${index}][size]`, size.size);
        }
      });
    }

    // Handle images
    if (!addColors) {
      formData.images.forEach((image, index) => {
        data.append(`images[${index}]`, image);
      });
    }

    // Handle colors and sizes
    if (addColors && formData.colors.length > 0) {
      formData.colors.forEach((color, index) => {
        if (color.color) {
          data.append(`colors[${index}][color]`, color.color);
          if (color.image) {
            data.append(`colors[${index}][image]`, color.image);
          }
          color.sizes.forEach((size, sizeIndex) => {
            if (size.size) {
              data.append(`colors[${index}][sizes][${sizeIndex}][size]`, size.size);
            }
          });
        }
      });
    }

    try {
      await axios.post(`${apiUrl}/products`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product created successfully!");
      setFormData({
        name: "",
        price: "",
        discount_price: "",
        category_id: "",
        clothing: false,
        images: [],
        colors: [{ color: "", image: null, sizes: [{ size: "" }] }],
        bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
        bumps: [{ title: "", image: null, description: "" }],
        homepage: {
          headline: "",
          paragraph: "",
          description: ""
        },
        singleProductSizes: [{ size: "" }]
      });
      setAddColors(false);
      setAddOffer(false);
      setShowHomepageFields(false);
      setShowBulkDiscounts(false);
      setShowSingleSizes(false);
      if (onProductCreated) onProductCreated();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Product</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Category*</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="offer"
              checked={addOffer}
              onChange={() => setAddOffer(!addOffer)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="offer" className="ml-2 block text-gray-700">
              Add Discount Offer
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBumps"
              checked={showBumps}
              onChange={() => setShowBumps(!showBumps)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showBumps" className="ml-2 block text-gray-700">
              Add Bump Offers
            </label>
          </div>

          {addOffer && (
            <div>
              <label className="block text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter discount price"
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="clothing"
              checked={formData.clothing}
              onChange={(e) => setFormData(prev => ({ ...prev, clothing: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="clothing" className="ml-2 block text-gray-700">
              Clothing Item (Please upload images in 3:4 Like 960X1280 ratio for best display)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="addColors"
              checked={addColors}
              onChange={() => setAddColors(!addColors)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="addColors" className="ml-2 block text-gray-700">
              Add Colors and Sizes
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showHomepage"
              checked={showHomepageFields}
              onChange={() => setShowHomepageFields(!showHomepageFields)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showHomepage" className="ml-2 block text-gray-700">
              Add Sales Letter
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBulkDiscounts"
              checked={showBulkDiscounts}
              onChange={() => setShowBulkDiscounts(!showBulkDiscounts)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showBulkDiscounts" className="ml-2 block text-gray-700">
              Add Bulk Discounts
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSingleSizes"
              checked={showSingleSizes}
              onChange={() => setShowSingleSizes(!showSingleSizes)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showSingleSizes" className="ml-2 block text-gray-700">
              Add Single Product Sizes
            </label>
          </div>
        </div>

        {showHomepageFields && (
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Add Content</h3>
            <div>
              <label className="block text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.homepage.headline}
                onChange={handleHomepageChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter headline"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Paragraph</label>
              <textarea
                name="paragraph"
                value={formData.homepage.paragraph}
                onChange={handleHomepageChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter paragraph"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <ReactQuill
                  value={formData.homepage.description || ""}
                  onChange={handleQuillChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  style={{ height: "200px" }}
              />
            </div>
          </div>
        )}

        {showBulkDiscounts && (
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Bulk Discounts</h3>
            {formData.bulk_discounts.map((discount, index) => (
              <div key={index} className="border p-3 rounded space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={discount.title}
                      onChange={(e) => handleBulkDiscountChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="e.g., Buy 3 Get 10% Off"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Offer Quantity*</label>
                    <input
                      type="number"
                      name="offer_quantity"
                      value={discount.offer_quantity}
                      onChange={(e) => handleBulkDiscountChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="e.g., 3"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Discount Percentage*</label>
                    <input
                      type="number"
                      name="discount_percentage"
                      value={discount.discount_percentage}
                      onChange={(e) => handleBulkDiscountChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="e.g., 10"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                {formData.bulk_discounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBulkDiscount(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove Discount
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBulkDiscount}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Another Discount
            </button>
          </div>
        )}

        {showSingleSizes && (
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Single Product Sizes</h3>
            {formData.singleProductSizes.map((size, index) => (
              <div key={index} className="border p-3 rounded space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Size*</label>
                    <input
                      type="text"
                      name="size"
                      value={size.size}
                      onChange={(e) => handleSingleSizeChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter size (e.g., S, M, L)"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-gray-700 mb-1">Quantity*</label>
                    <input
                      type="number"
                      name="quantity"
                      value={size.quantity}
                      onChange={(e) => handleSingleSizeChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter quantity"
                      min="0"
                    />
                  </div> */}
                </div>
                {formData.singleProductSizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSingleSize(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove Size
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSingleSize}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Another Size
            </button>
          </div>
        )}

        {!addColors && (
          <div>
            <label className="block text-gray-700 mb-1">Product Images*</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              accept="image/*"
              required={!addColors}
            />
            <p className="text-sm text-gray-500 mt-1">Images will be automatically compressed to WebP format (max 0.5MB each)</p>
          </div>
        )}

        {addColors && (
          <div className="space-y-4">
            {formData.colors.map((color, colorIndex) => (
              <div key={colorIndex} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Color*</label>
                    <input
                      type="text"
                      name="color"
                      value={color.color}
                      onChange={(e) => handleColorChange(colorIndex, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter color name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Color Image*</label>
                    <input
                      type="file"
                      onChange={(e) => handleColorImageChange(colorIndex, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      accept="image/*"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Image will be compressed to WebP format (max 0.5MB)</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 mb-2">Sizes</label>
                  {color.sizes.map((size, sizeIndex) => (
                    <div key={sizeIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => handleSizeChange(colorIndex, sizeIndex, e)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter size"
                      />
                      {sizeIndex === color.sizes.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addSize(colorIndex)}
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Add Size
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Another Color
            </button>
          </div>
        )}

        {showBumps && (
          <div className="border p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Bump Offers</h3>
            {formData.bumps.map((bump, index) => (
              <div key={index} className="border p-3 rounded space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-1">Bump Price*</label>
                    <input
                      type="text"
                      name="bump_price"
                      value={bump.bump_price}
                      onChange={(e) => handleBumpChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Bump offer Price"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={bump.title}
                      onChange={(e) => handleBumpChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Bump offer title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Image</label>
                    <input
                      type="file"
                      onChange={(e) => handleBumpImageChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">Image will be compressed to WebP format (max 0.5MB)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={bump.description}
                    onChange={(e) => handleBumpChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bump offer description"
                    rows="3"
                    required
                  />
                </div>
                {formData.bumps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBump(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove Bump
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBump}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Another Bump
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;