import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateMenu from "./UpdateMenu";
import { FaPlus, FaLayerGroup, FaHome, FaLink, FaGripHorizontal } from "react-icons/fa";

const apiUrl = config.apiUrl;

const flattenCategories = (categories = [], depth = 0) =>
  categories.flatMap((category) => {
    const labelPrefix = depth > 0 ? `${"— ".repeat(depth)}` : "";
    return [
      {
        ...category,
        label: `${labelPrefix}${category.name}`,
      },
      ...flattenCategories(category.children || [], depth + 1),
    ];
  });

const formatMenuType = (menuType) => {
  if (menuType === 'home_page') return 'Home Page';
  if (menuType === 'sidebar') return 'Sidebar';
  if (menuType === 'footer') return 'Footer';
  return 'Header';
};

const ViewMenu = ({ onAddNewMenu }) => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "",
    url: "",
    category_id: "",
    menu_type: "header",
    order: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusResponse, categoriesResponse] = await Promise.all([
          axios.get(`${apiUrl}/menus`),
          axios.get(`${apiUrl}/category`),
        ]);

        setMenus(menusResponse.data);

        const categoryList = Array.isArray(categoriesResponse.data?.categories)
          ? categoriesResponse.data.categories
          : [];
        setCategories(flattenCategories(categoryList));
      } catch (err) {
        console.error("Error fetching Menus:", err);
        setError("Failed to load Menus.");
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Menu?")) {
      try {
        await axios.delete(`${apiUrl}/menudelete/${id}`);
        setMenus((prev) => prev.filter((menu) => menu.id !== id));
      } catch (err) {
        console.error("Error deleting Menu:", err);
        setError("Failed to delete Menu.");
      }
    }
  };

  const handleEditClick = (menu) => {
    setEditingMenu(menu.id);
    setFormData({ 
      name: menu.name,
      url: menu.url,
      category_id: menu.category_id || "",
      menu_type: menu.menu_type,
      order: menu.order,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "order" ? parseInt(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingMenu) {
      setError("No menu selected for editing.");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${apiUrl}/menusupdate/${editingMenu}`, formData);
      alert("Menu updated successfully");
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === editingMenu ? { ...menu, ...formData } : menu
        )
      );
      setEditingMenu(null);
    } catch (err) {
      console.error("Error updating menu:", err);
      setError("Failed to update menu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

 return (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_32%),linear-gradient(180deg,_#f8fffb_0%,_#f7fafc_48%,_#eefbf4_100%)] p-4 md:p-6">
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_18px_50px_rgba(16,185,129,0.12)]">
        <div className="flex flex-col gap-6 bg-[linear-gradient(135deg,_#f0fdf4_0%,_#ecfeff_52%,_#ffffff_100%)] px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <FaLayerGroup className="text-[11px]" />
                Site Management
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Menu Management
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                Organize header, footer, sidebar, and homepage menu blocks from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddNewMenu}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-green-700"
            >
              <FaPlus className="text-xs" />
              Add New Menu
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <FaLayerGroup />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Menus
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{menus.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                  <FaHome />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Homepage Blocks
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {menus.filter((menu) => menu.menu_type === "home_page").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <FaLink />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category Linked
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {menus.filter((menu) => Boolean(menu.category_id)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">All Menus</h3>
            <p className="text-sm text-slate-500">
              Review labels, targets, menu types, and sort order.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <FaGripHorizontal className="text-[10px]" />
            Sorted by order
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                {["Name", "Target", "Type", "Order", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {menus.map((menu) => (
                <tr key={menu.id} className="transition hover:bg-emerald-50/40">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{menu.name}</span>
                      <span className="text-xs text-slate-500">
                        ID #{menu.id}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {menu.category_id ? (
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-slate-800">
                          {menu.category?.name || "Category"}
                        </span>
                        <span className="text-slate-500">
                          /category/{menu.category?.slug || menu.category_id}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={menu.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline"
                      >
                        {menu.url?.length > 40
                          ? menu.url.substring(0, 40) + "..."
                          : menu.url}
                      </a>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {formatMenuType(menu.menu_type)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      #{menu.order}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditClick(menu)}
                        className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {menus.length === 0 && (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FaLayerGroup className="text-lg" />
            </div>
            <h4 className="mt-4 text-lg font-bold text-slate-900">No menus found</h4>
            <p className="mt-2 text-sm text-slate-500">
              Start by creating your first header, footer, sidebar, or homepage menu item.
            </p>
            <button
              type="button"
              onClick={onAddNewMenu}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-green-700"
            >
              <FaPlus className="text-xs" />
              Add New Menu
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMenu && (
        <UpdateMenu
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onCancel={() => setEditingMenu(null)}
          loading={saving}
          error={error}
          categories={categories}
          loadingCategories={loadingCategories}
        />
      )}

    </div>
  </div>
);
};

export default ViewMenu;
