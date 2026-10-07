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
      className={`bg-gray-600 text-white fixed h-full top-0 left-0 z-40 pt-28
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 transition-all duration-300 ease-in-out shadow-xl overflow-y-auto`}
    >
      <div
        className="absolute top-24 right-2 cursor-pointer hover:text-blue-300 transition-colors"
        onClick={() => window.open("/", "_blank")}
        title="Go to Homepage"
      >
        <FaArrowAltCircleUp size={24} className="transform rotate-45" />
      </div>

      <ul className="space-y-2 p-4">
        {menuItems.map((item) => {
          if (!hasAccess(item.key)) {
            return null;
          }

          return (
            <li key={item.key}>
              {item.subMenus ? (
                <>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      expandedMenu === item.key ? "bg-green-700" : "hover:bg-green-700"
                    }`}
                    onClick={() => handleMainMenuClick(item.key)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <FaAngleDown
                      className={`transition-transform duration-200 ${
                        expandedMenu === item.key ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {expandedMenu === item.key && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.subMenus.map((subItem) => {
                        if (!hasAccess(item.key, subItem.key)) {
                          return null;
                        }

                        return (
                          <li key={subItem.key}>
                            <div
                              className={`flex items-center justify-between p-2 pl-6 rounded-lg cursor-pointer ${
                                expandedSubMenu === subItem.key ? "bg-green-700" : "hover:bg-green-700"
                              }`}
                              onClick={(event) => handleSubMenuClick(subItem.key, event)}
                            >
                              <div className="flex items-center">
                                <span className="ml-1">{subItem.title}</span>
                              </div>
                              {subItem.subItems?.length > 0 && (
                                <FaAngleRight
                                  className={`transition-transform duration-200 ${
                                    expandedSubMenu === subItem.key ? "rotate-90" : ""
                                  }`}
                                />
                              )}
                            </div>

                            {expandedSubMenu === subItem.key && subItem.subItems?.length > 0 && (
                              <ul className="ml-8 pl-2 mt-1 space-y-1 border-l-2 border-green-700">
                                {subItem.subItems.map((menuItem) => {
                                  if (!hasAccess(item.key, subItem.key, menuItem.key)) {
                                    return null;
                                  }

                                  return (
                                    <li
                                      key={menuItem.key}
                                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                        selectedMenu === menuItem.key
                                          ? "bg-green-700 font-bold"
                                          : "hover:bg-green-700"
                                      }`}
                                      onClick={() => handleMenuItemClick(menuItem.key)}
                                    >
                                      {menuItem.icon}
                                      <span className="ml-2">{menuItem.name}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    selectedMenu === item.directItem ? "bg-green-700" : "hover:bg-green-700"

                  }`}
                  onClick={() => {
                    if (item.key === "dashboard") {
                      handleDashboardClick();
                    } else {
                      handleMenuItemClick(item.directItem);
                    }
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </div>
              )}
            </li>
          );
        })}

        <li>
          <div
            className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={20} />
            <span className="ml-3">Logout</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
