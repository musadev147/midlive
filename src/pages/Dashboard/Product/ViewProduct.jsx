import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Link } from "react-router-dom";
import UpdateProduct from "./UpdateProduct";
import imageCompression from "browser-image-compression";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const apiUrl = config.apiUrl;

const ViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("all");
  const [appliedItemsPerPage, setAppliedItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    category_id: "",
    clothing: false,
    images: [],
    colors: [{ color: "", image: null, sizes: [{ size: "" }] }],
    bulk_discounts: [{ title: "", offer_quantity: "", discount_percentage: "" }],
    bumps: [{ title: "", bump_price: "", image: null, description: "" }],
    homepage: {
      headline: "",
      paragraph: "",
      description: ""
    },
    singleProductSizes: [{ size: "" }]
  });
  const [showHomepageFields, setShowHomepageFields] = useState(false);
  const [showBulkDiscounts, setShowBulkDiscounts] = useState(false);
  const [showBumps, setShowBumps] = useState(false);
  const [showSingleProductSizes, setShowSingleProductSizes] = useState(false);

  const imageCompressionOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: "image/webp"
  };

  console.log("formData:", formData);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes] = await Promise.all([
          axios.get(`${apiUrl}/category`)
        ]);
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        setError("Failed to load products and categories");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryMap = useMemo(() => {
    return new Map(categories.map(category => [String(category.id), category.name]));
  }, [categories]);

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: appliedItemsPerPage,
      };

      const query = appliedSearchTerm.trim();
      if (query) params.search = query;
      if (appliedCategory !== "all") params.category_id = appliedCategory;

      const response = await axios.get(`${apiUrl}/products`, { params });
      const payload = response.data;
      const paginatedData = payload?.data ?? payload;

      setProducts(Array.isArray(paginatedData) ? paginatedData : []);
      setTotalProducts(payload?.total ?? (Array.isArray(paginatedData) ? paginatedData.length : 0));
      setTotalPages(payload?.last_page ?? 1);
      setCurrentPage(payload?.current_page ?? page);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [appliedItemsPerPage, appliedSearchTerm, appliedCategory]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const applyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedCategory(selectedCategory);
    setAppliedItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setItemsPerPage(10);
    setAppliedSearchTerm("");
    setAppliedCategory("all");
    setAppliedItemsPerPage(10);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${apiUrl}/productdelete/${id}`);
        fetchProducts(currentPage);
      } catch (err) {
        setError("Failed to delete product");
        console.error("Error:", err?.response?.data?.message || err.message);
      }
    }
  };

  const handleEditClick = async (product) => {
    setEditingProduct(product.id);
    setFormData({
      slug: product.slug || "",
      name: product.name || "",
      price: product.price || "",
      discount_price: product.discount_price || "",
      category_id: product.category_id || "",
      clothing: product.clothing || false,
      images: product.images || [],
      colors: product.colors?.map(color => ({
        id: color.id || null,
        color: color.color || "",
        image: color.image || null,
        sizes: color.sizes?.map(size => ({
          id: size.id || null,
          size: size.size || ""
        })) || []
      })) || [],
      bulk_discounts: product.bulk_discounts?.map(discount => ({
        id: discount.id || null,
        title: discount.title || "",
        offer_quantity: discount.offer_quantity || "",
        discount_percentage: discount.discount_percentage || ""
      })) || [],
      bumps: product.bumps?.map(bump => ({
        id: bump.id || null,
        title: bump.title || "",
        bump_price: bump.bump_price || "",
        image: bump.image || null,
        description: bump.description || ""
      })) || [],

      singleProductSizes: product.single_product_sizes?.map(size => ({
        id: size.id,
        size: size.size || ""
      })) || [],

      homepage: product.homepage || {
        headline: "",
        paragraph: "",
        description: ""
      }
    });
    setShowHomepageFields(!!product.homepage);
    setShowBulkDiscounts(product.bulk_discounts?.length > 0);
    setShowBumps(product.bumps?.length > 0);
    setShowSingleProductSizes(product.single_product_sizes?.length > 0);
  };

  const handleBumpImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBlob = await imageCompression(file, imageCompressionOptions);
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, ".webp"),
        { type: "image/webp", lastModified: Date.now() }
      );

      const updatedBumps = [...formData.bumps];
      updatedBumps[index] = {
        ...updatedBumps[index],
        image: compressedFile
      };

      setFormData(prev => ({
        ...prev,
        bumps: updatedBumps
      }));
    } catch (error) {
      console.error("Image compression failed:", error);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressedBlob = await imageCompression(file, imageCompressionOptions);
          
          // Blob কে File-এ কনভার্ট করুন
          const compressedFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^/.]+$/, ".webp"),
            { 
              type: "image/webp", 
              lastModified: Date.now() 
            }
          );
          
          return compressedFile;
        })
      );
      
      // নতুন ফাইলগুলিকে existing ইমেজের সাথে merge করুন
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...compressedFiles] 
      }));
    } catch (error) {
      console.error("Image compression error:", error);
      setError("Failed to compress images");
    }
  };

  // Existing ইমেজ ডিলিট করার ফাংশন
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleColorImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBlob = await imageCompression(file, imageCompressionOptions);
      
      // Blob কে File-এ কনভার্ট করুন
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, ".webp"),
        { 
          type: "image/webp", 
          lastModified: Date.now() 
        }
      );

      const colors = [...formData.colors];
      colors[index].image = compressedFile;
      setFormData(prev => ({ ...prev, colors }));
    } catch (error) {
      console.error("Color image compression error:", error);
      setError("Failed to compress color image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("discount_price", formData.discount_price || "");
      data.append("category_id", formData.category_id);
      data.append("slug", formData.slug);
      data.append("clothing", formData.clothing ? "1" : "0");

      if (showHomepageFields) {
        data.append("homepage[headline]", formData.homepage.headline || "");
        data.append("homepage[paragraph]", formData.homepage.paragraph || "");
        data.append("homepage[description]", formData.homepage.description || "");
      }

      if (showBulkDiscounts && formData.bulk_discounts.length > 0) {
        formData.bulk_discounts.forEach((discount, index) => {
          if (discount.id) data.append(`bulk_discounts[${index}][id]`, discount.id);
          data.append(`bulk_discounts[${index}][title]`, discount.title || "");
          data.append(`bulk_discounts[${index}][offer_quantity]`, discount.offer_quantity || "");
          data.append(`bulk_discounts[${index}][discount_percentage]`, discount.discount_percentage || "");
        });
      }

      if (showBumps && formData.bumps.length > 0) {
        formData.bumps.forEach((bump, index) => {
          if (bump.id) data.append(`bumps[${index}][id]`, bump.id);
          data.append(`bumps[${index}][title]`, bump.title || "");
          data.append(`bumps[${index}][bump_price]`, bump.bump_price || "");
          data.append(`bumps[${index}][description]`, bump.description || "");
          if (bump.image instanceof File) {
            data.append(`bumps[${index}][image]`, bump.image);
          } else if (typeof bump.image === 'string') {
            data.append(`bumps[${index}][existing_image]`, bump.image);
          }
        });
      }

      if (showSingleProductSizes && formData.singleProductSizes.length > 0) {
        formData.singleProductSizes.forEach((size, index) => {
          if (size.id) {
            data.append(`singleProductSizes[${index}][id]`, size.id);
          }
          data.append(`singleProductSizes[${index}][size]`, size.size || "");
        });
      }

      // ইমেজ হ্যান্ডলিং - ডুপ্লিকেট কোড রিমুভ করা
      if (!formData.clothing && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          if (image instanceof File) {
            data.append(`images[${index}]`, image);
          } else if (typeof image === 'string') {
            data.append(`existing_images[${index}]`, image);
          } else if (image && image.image) {
            data.append(`existing_images[${index}]`, image.image);
          }
        });
      }

      // Colors হ্যান্ডলিং - ডুপ্লিকেট কোড রিমুভ করা
      if (formData.colors.length > 0) {
        formData.colors.forEach((color, index) => {
          if (color.id) data.append(`colors[${index}][id]`, color.id);
          data.append(`colors[${index}][color]`, color.color || "");
          
          if (color.image instanceof File) {
            data.append(`colors[${index}][image]`, color.image);
          } else if (color.image) {
            data.append(`colors[${index}][existing_image]`, color.image);
          }
          
          color.sizes.forEach((size, sizeIndex) => {
            if (size.id) data.append(`colors[${index}][sizes][${sizeIndex}][id]`, size.id);
            data.append(`colors[${index}][sizes][${sizeIndex}][size]`, size.size || "");
          });
        });
      }

      await axios.post(`${apiUrl}/productsupdate/${editingProduct}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Product updated successfully!");
      fetchProducts(currentPage);
      setEditingProduct(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
      console.error("Error:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold">Product List</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total Products: {totalProducts}
          </p>
        </div>
        <div className="inline-flex items-center rounded-lg bg-green-50 px-4 py-2 text-green-700 font-semibold border border-green-100">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, slug, price"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
          >
            {[10, 20, 50, 100].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={applyFilters}
            className="w-full rounded-lg bg-green-400 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 shadow-sm"
          >
            Filters
          </button>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-lg border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="bg-green-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
                      <span>{(currentPage - 1) * appliedItemsPerPage + index + 1}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-red-500 line-through">৳{product.price}</div>
                  {product.discount_price && (
                    <div className="text-green-600 font-semibold">৳{product.discount_price}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {categoryMap.get(String(product.category_id)) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                  <Link 
                    to={`/${product.slug}`} 
                    className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm inline-block"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-green-600">
                  {(currentPage - 1) * appliedItemsPerPage + index + 1}
                </div>
                <h3 className="mt-1 text-base font-semibold text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 break-all">{product.slug}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                {categoryMap.get(String(product.category_id)) || "N/A"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="text-red-500 line-through">৳{product.price}</div>
                {product.discount_price && (
                  <div className="font-semibold text-green-600">৳{product.discount_price}</div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEditClick(product)}
                className="rounded-lg border border-green-400 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-400 hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="rounded-lg border border-red-600 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete
              </button>
              <Link
                to={`/${product.slug}`}
                className="rounded-lg border border-emerald-500 px-3 py-2 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-500 hover:text-white"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No products found. Try changing the search or category filter.
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * appliedItemsPerPage + 1} to{" "}
            {Math.min(currentPage * appliedItemsPerPage, totalProducts)} of {totalProducts} items
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <FaChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {editingProduct && (
          <UpdateProduct
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingProduct(null)}
          categories={categories}
          showHomepageFields={showHomepageFields}
          setShowHomepageFields={setShowHomepageFields}
          showBumps={showBumps}
          setShowBumps={setShowBumps}
          handleImageChange={handleImageChange}
          handleColorImageChange={handleColorImageChange}
          handleBumpImageChange={handleBumpImageChange}
          showSingleProductSizes={showSingleProductSizes}
          setShowSingleProductSizes={setShowSingleProductSizes}
          removeImage={removeImage}
        />
      )}
    </div>
  );
};

export default ViewProduct;
