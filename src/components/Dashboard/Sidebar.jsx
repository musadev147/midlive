import React, { useEffect, useMemo, useState } from "react";
import {
  FaAngleDown,
  FaUserFriends,
  FaSignOutAlt,
  FaBox,
  FaChartLine,
  FaNetworkWired,
  FaPlus,
  FaListAlt,
  FaCoins,
  FaArrowAltCircleUp,
  FaGlobe,
  FaCreditCard,
  FaAngleRight,
  FaCode,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import axios from "axios";
import { config } from "../../config";
import { useNavigate } from "react-router-dom";

const apiUrl = config.apiUrl;

const Sidebar = ({
  isSidebarOpen,
  selectedMenu,
  setSelectedMenu,
  toggleSidebar,
}) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const userRole = localStorage.getItem("type");

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const getAccessibleMenus = () => {
    const roleAccess = {
      admin: {
        dashboard: ["dashboard"],
        prescription: ["PrescriptionManagement"],
        labTests: ["LabTestManagement"],
        customScripts: ["headerFooterSettings"],
        products: {
          productsSub: ["createProduct", "productOverview"],
          categoriesSub: ["createCategory", "categoryOverview"],
        },
        customers: ["customerOverview"],
        leads: ["leadOverview"],
        siteManagement: {
          menu: ["createMenu", "menuOverview"],
          logo: ["createLogo", "logoOverview"],
          banner: ["createBanner", "bannerOverview"],
          community: ["createCommunity", "communityOverview"],
          contact: ["createContact", "contactOverview"],
          contactInfo: ["createContactInfo", "contactInfoOverview"],
          social: ["createSocial", "socialOverview"],
          legal: ["createLegal", "legalOverview"],
          offers: ["OfferManagement"],
          customScripts: ["headerFooterSettings"],
        },
        payments: {
          advancePay: ["createAdvancePay", "advancePayOverview"],
          paymentMethod: ["createPaymentMethod", "paymentMethodOverview"],
          deliveryCharge: ["createDeliveryCharge", "deliveryChargeOverview"],
        },
        coinSystems: {
          bonusCoins: ["createCoin", "coinOverview"],
          packageCoins: ["createPackage", "packageOverview"],
          packageTnx: ["tnxOverview"],
        },
        pixel: {
          pixelSub: ["createPixel", "PixelOverview"],
        },
        steadfast: {
          steadfastSub: ["createSteadfast", "steadfastOverview"],
        },
        users: ["usersOverview"],
      },
      moderator: {
        dashboard: ["dashboard"],
        customScripts: ["headerFooterSettings"],
        products: {
          productsSub: ["createProduct", "productOverview"],
          categoriesSub: ["createCategory", "categoryOverview"],
        },
        customers: ["customerOverview"],
        leads: ["leadOverview"],
        siteManagement: {
          banner: ["createBanner", "bannerOverview"],
          community: ["createCommunity", "communityOverview"],
          contact: ["createContact", "contactOverview"],
          customScripts: ["headerFooterSettings"],
        },
        payments: {
          advancePay: ["createAdvancePay", "advancePayOverview"],
          paymentMethod: ["createPaymentMethod", "paymentMethodOverview"],
        },
        coinSystems: {
          bonusCoins: ["createCoin", "coinOverview"],
        },
        steadfast: {
          steadfastSub: ["createSteadfast", "steadfastOverview"],
        },
      },
      user: {
        dashboard: ["dashboard"],
      },
    };

    return roleAccess[userRole] || {};
  };

  const hasAccess = (mainKey, subKey = null, itemKey = null) => {
    const accessibleMenus = getAccessibleMenus();

    if (!subKey && !itemKey) {
      if (Array.isArray(accessibleMenus[mainKey])) {
        return accessibleMenus[mainKey].length > 0;
      }

      if (typeof accessibleMenus[mainKey] === "object") {
        return Object.keys(accessibleMenus[mainKey]).length > 0;
      }

      return false;
    }

    if (itemKey && subKey) {
      return accessibleMenus[mainKey]?.[subKey]?.includes(itemKey) || false;
    }

    if (subKey) {
      return accessibleMenus[mainKey]?.[subKey]?.length > 0 || false;
    }

    return false;
  };

  const menuItems = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: <MdDashboard size={20} />,
        key: "dashboard",
        directItem: "dashboard",
      },
      {
        title: "Prescription",
        icon: <MdDashboard size={20} />,
        key: "prescription",
        directItem: "PrescriptionManagement",
      },
      {
        title: "Lab Tests",
        icon: <MdDashboard size={20} />,
        key: "labTests",
        directItem: "LabTestManagement",
      },
      {
        title: "Store Management",
        icon: <FaBox size={20} />,
        key: "products",
        subMenus: [
          {
            title: "Products",
            key: "productsSub",
            subItems: [
              { name: "Add Product", key: "createProduct", icon: <FaPlus size={14} /> },
              { name: "View Products", key: "productOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Categories",
            key: "categoriesSub",
            subItems: [
              { name: "Add Category", key: "createCategory", icon: <FaPlus size={14} /> },
              { name: "View Categories", key: "categoryOverview", icon: <FaListAlt size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Orders",
        icon: <FaUserFriends size={20} />,
        key: "customers",
        directItem: "customerOverview",
      },
      {
        title: "Incomplete Orders",
        icon: <FaUserFriends size={20} />,
        key: "leads",
        directItem: "leadOverview",
      },
      {
        title: "Site Management",
        icon: <FaGlobe size={20} />,
        key: "siteManagement",
        subMenus: [
          {
            title: "Menu",
            key: "menu",
            subItems: [
              { name: "Add Menu", key: "createMenu", icon: <FaPlus size={14} /> },
              { name: "View Menus", key: "menuOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Website Logo",
            key: "logo",
            subItems: [
              { name: "Add Logo", key: "createLogo", icon: <FaPlus size={14} /> },
              { name: "View Logos", key: "logoOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Banner",
            key: "banner",
            subItems: [
              { name: "Add Banner", key: "createBanner", icon: <FaPlus size={14} /> },
              { name: "View Banners", key: "bannerOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Offers",
            key: "offers",
            subItems: [
              { name: "View Offers", key: "OfferManagement", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Community",
            key: "community",
            subItems: [
              { name: "Add Community", key: "createCommunity", icon: <FaPlus size={14} /> },
              { name: "View Communities", key: "communityOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Contact",
            key: "contact",
            subItems: [
              { name: "Add Contact", key: "createContact", icon: <FaPlus size={14} /> },
              { name: "View Contacts", key: "contactOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Contact Info",
            key: "contactInfo",
            subItems: [
              { name: "Add Contact Info", key: "createContactInfo", icon: <FaPlus size={14} /> },
              { name: "View Contact Info", key: "contactInfoOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Social Links",
            key: "social",
            subItems: [
              { name: "Add Social", key: "createSocial", icon: <FaPlus size={14} /> },
              { name: "View Social Links", key: "socialOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Legal Pages",
            key: "legal",
            subItems: [
              { name: "Add Legal", key: "createLegal", icon: <FaPlus size={14} /> },
              { name: "View Legal Pages", key: "legalOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Custom Scripts",
            key: "customScripts",
            subItems: [
              { name: "Header Footer Code", key: "headerFooterSettings", icon: <FaCode size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Header Footer Scripts",
        icon: <FaCode size={20} />,
        key: "customScripts",
        directItem: "headerFooterSettings",
      },
      {
        title: "Payments",
        icon: <FaCreditCard size={20} />,
        key: "payments",
        subMenus: [
          {
            title: "Advance Pay",
            key: "advancePay",
            subItems: [
              { name: "Add Advance Pay", key: "createAdvancePay", icon: <FaPlus size={14} /> },
              { name: "View Advance Pay", key: "advancePayOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Payment Method",
            key: "paymentMethod",
            subItems: [
              { name: "Add Payment Method", key: "createPaymentMethod", icon: <FaPlus size={14} /> },
              { name: "View Payment Methods", key: "paymentMethodOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Delivery Charge",
            key: "deliveryCharge",
            subItems: [
              { name: "Add Delivery", key: "createDeliveryCharge", icon: <FaPlus size={14} /> },
              { name: "View Delivery Charges", key: "deliveryChargeOverview", icon: <FaListAlt size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Coin Systems",
        icon: <FaCoins size={20} />,
        key: "coinSystems",
        subMenus: [
          {
            title: "Bonus Coins",
            key: "bonusCoins",
            subItems: [
              { name: "Add Coins", key: "createCoin", icon: <FaPlus size={14} /> },
              { name: "View Bonus Coins", key: "coinOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Package Coins",
            key: "packageCoins",
            subItems: [
              { name: "Add Package", key: "createPackage", icon: <FaPlus size={14} /> },
              { name: "View Packages", key: "packageOverview", icon: <FaListAlt size={14} /> },
            ],
          },
          {
            title: "Package Transactions",
            key: "packageTnx",
            subItems: [
              { name: "View Transactions", key: "tnxOverview", icon: <FaListAlt size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Tracking Setup",
        icon: <FaChartLine size={20} />,
        key: "pixel",
        subMenus: [
          {
            title: "Facebook",
            key: "pixelSub",
            subItems: [
              { name: "Add Pixel", key: "createPixel", icon: <FaPlus size={14} /> },
              { name: "View Pixels", key: "PixelOverview", icon: <FaListAlt size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Courier Setup",
        icon: <FaNetworkWired size={20} />,
        key: "steadfast",
        subMenus: [
          {
            title: "Steadfast",
            key: "steadfastSub",
            subItems: [
              { name: "Add Steadfast", key: "createSteadfast", icon: <FaPlus size={14} /> },
              { name: "View Steadfast", key: "steadfastOverview", icon: <FaListAlt size={14} /> },
            ],
          },
        ],
      },
      {
        title: "Users",
        icon: <FaUserFriends size={20} />,
        key: "users",
        directItem: "usersOverview",
      },
    ],
    []
  );

  useEffect(() => {
    for (const mainItem of menuItems) {
      if (mainItem.subMenus) {
        for (const subItem of mainItem.subMenus) {
          if (subItem.subItems?.some((item) => item.key === selectedMenu)) {
            setExpandedMenu(mainItem.key);
            setExpandedSubMenu(subItem.key);
            return;
          }
        }
      }

      if (mainItem.key === selectedMenu || mainItem.directItem === selectedMenu) {
        setExpandedMenu(mainItem.key);
        return;
      }
    }
  }, [menuItems, selectedMenu]);

  const handleMainMenuClick = (menuKey) => {
    if (expandedMenu === menuKey) {
      setExpandedMenu(null);
      setExpandedSubMenu(null);
    } else {
      setExpandedMenu(menuKey);
      setExpandedSubMenu(null);
    }
  };

  const handleSubMenuClick = (menuKey, event) => {
    event.stopPropagation();

    if (expandedSubMenu === menuKey) {
      setExpandedSubMenu(null);
    } else {
      setExpandedSubMenu(menuKey);
    }
  };

  const handleMenuItemClick = (menuKey) => {
    setSelectedMenu(menuKey);

    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDashboardClick = () => {
    setSelectedMenu("dashboard");

    if (isMobile) {
      toggleSidebar();
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("type");
    localStorage.removeItem("user");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        clearLocalStorage();
        navigate("/login");
        return;
      }

      await axios.post(
        `${apiUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      clearLocalStorage();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      clearLocalStorage();
      navigate("/login");
      alert(error.response?.data?.message || "Logged out successfully");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-40 h-full w-64 pt-20 md:pt-24
    bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800
    text-gray-100 shadow-2xl overflow-y-auto
    transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Quick Action */}
      {/* <div className="absolute top-24 right-3">
        <div
          onClick={() => window.open("/", "_blank")}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
          title="Go to Homepage"
        >
          <FaArrowAltCircleUp className="rotate-45 text-green-400" size={18} />
        </div>
      </div> */}

      {/* MENU */}
      <div className="px-2 pb-5 md:px-3 md:pb-8">
        <ul className="space-y-0.5 md:space-y-1">

          {menuItems.map((item) => {
            if (!hasAccess(item.key)) return null;

            return (
              <li key={item.key} className="relative">

                {/* DIRECT MENU */}
                {!item.subMenus ? (
                  <div
                    onClick={() => {
                      if (item.key === "dashboard") {
                        handleDashboardClick();
                      } else {
                        handleMenuItemClick(item.directItem);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 md:gap-3 md:px-4 md:py-3 rounded-xl cursor-pointer
                  transition-all duration-200 group
                  ${selectedMenu === item.directItem
                        ? "bg-green-500/15 text-green-300 border-l-4 border-green-400 shadow-md"
                        : "text-gray-300 hover:bg-gray-800/60"
                      }`}
                  >
                    <span className="text-green-400">{item.icon}</span>
                    <span className="text-sm font-medium tracking-wide">
                      {item.title}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* MAIN MENU */}
                    <div
                      onClick={() =>
                        setExpandedMenu(
                          expandedMenu === item.key ? null : item.key
                        )
                      }
                      className={`flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 rounded-xl cursor-pointer
                    transition-all duration-200
                    ${expandedMenu === item.key
                          ? "bg-gray-800/60"
                          : "hover:bg-gray-800/40"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">{item.icon}</span>
                        <span className="text-sm font-semibold tracking-wide">
                          {item.title}
                        </span>
                      </div>

                      <FaAngleDown
                        className={`text-gray-400 transition-transform duration-300 ${expandedMenu === item.key ? "rotate-180" : ""
                          }`}
                      />
                    </div>

                    {/* SUB MENU */}
                    {expandedMenu === item.key && (
                      <ul className="ml-3 mt-1 border-l border-gray-700 pl-2.5 space-y-0.5 md:ml-4 md:pl-3 md:space-y-1">

                        {item.subMenus.map((sub) => (
                          <li key={sub.key}>

                            {/* SUB TITLE */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedSubMenu(
                                  expandedSubMenu === sub.key ? null : sub.key
                                );
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg cursor-pointer
                            transition
                            ${expandedSubMenu === sub.key
                                  ? "bg-gray-800/50"
                                  : "hover:bg-gray-800/30"
                                }`}
                            >
                              <span className="text-xs md:text-sm text-gray-200">
                                {sub.title}
                              </span>

                              <FaAngleRight
                                className={`text-gray-500 transition-transform ${expandedSubMenu === sub.key
                                    ? "rotate-90"
                                    : ""
                                  }`}
                              />
                            </div>

                            {/* SUB ITEMS */}
                            {expandedSubMenu === sub.key && (
                              <ul className="ml-3 mt-1 space-y-1">

                                {sub.subItems.map((i) => (
                                  <li
                                    key={i.key}
                                    onClick={() => handleMenuItemClick(i.key)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2 rounded-lg cursor-pointer text-xs md:text-sm
                                  transition-all
                                  ${selectedMenu === i.key
                                        ? "bg-green-500/15 text-green-300 border-l-2 border-green-400"
                                        : "text-gray-300 hover:bg-gray-800/40"
                                      }`}
                                  >
                                    <span className="text-green-400">
                                      {i.icon}
                                    </span>
                                    {i.name}
                                  </li>
                                ))}

                              </ul>
                            )}
                          </li>
                        ))}

                      </ul>
                    )}
                  </>
                )}
              </li>
            );
          })}

          {/* LOGOUT */}
          <li className="pt-5 mt-4 border-t border-gray-800">
            <div
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 md:gap-3 md:px-4 md:py-3 rounded-xl cursor-pointer
            text-red-400 hover:bg-red-500/10 transition"
            >
              <FaSignOutAlt size={18} />
              <span className="text-xs md:text-sm font-semibold">Logout</span>
            </div>
          </li>

        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
