import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Dashboard/Navbar";
import Sidebar from "../../components/Dashboard/Sidebar";
import PrivateRoute from "./PrivateRoute";
import ViewHome from "./Home/ViewHome";
import CreateHome from "./Home/CreateHome";
import CreateCongratulation from "./Congratulation/CreateCongratulation";
import ViewCongratulation from "./Congratulation/ViewCongratulation";
import CreateForm from "./Form/CreateForm";
import ViewForm from "./Form/ViewForm";
import ViewTransaction from "./Transaction/ViewTransaction";
import CreateDeliveryCharge from "./DeliveryCharge/CreateDeliveryCharge";
import ViewDeliveryCharge from "./DeliveryCharge/ViewDeliveryCharge";
import CreatePixel from "./Pixel/CreatePixel";
import ViewPixel from "./Pixel/ViewPixel";
import CreateProductPage from "./ProductPage/CreateProductPage";
import ViewProductPage from "./ProductPage/ViewProductPage";
import ViewCustomer from "./Customer/ViewCustomer";
import CreateColor from "./Color/CreateColor";
import ViewColor from "./Color/ViewColor";
import CreateProduct from "./Product/CreateProduct";
import ViewProduct from "./Product/ViewProduct";
import CreateSize from "./Size/CreateSize";
import ViewSize from "./Size/ViewSize";
import CreateSteadfast from "./Steadfast/CreateSteadfast";
import ViewStedfast from "./Steadfast/ViewSteadfast";
import CreateCategory from "./Category/CreateCategory";
import ViewCategory from "./Category/ViewCategory";
import CreateLegal from "./Legal/CreateLegal";
import ViewLegal from "./Legal/ViewLegal";
import CreateContact from "./Contact/CreateContact";
import ViewContact from "./Contact/ViewContact";
import CreateContactInfo from "./ContactInfo/CreateContactInfo";
import ViewContactInfo from "./ContactInfo/ViewContactInfo";
import CreateMenu from "./Menu/CreateMenu";
import ViewMenu from "./Menu/ViewMenu";
import CreateSocial from "./Social/CreateSocial";
import ViewSocial from "./Social/ViewSocial";
import CreateWebsiteLogo from "./Branding/CreateWebsiteLogo";
import ViewWebsiteLogo from "./Branding/ViewWebsiteLogo";
import CreateBonus from "./CoinBonus/CreateBonus";
import ViewBonus from "./CoinBonus/ViewBonus";
import CreatePackage from "./CoinPackage/CreatePackage";
import ViewPackage from "./CoinPackage/ViewPackage";
import CreateTnx from "./CoinTnx.jsx/CreateTnx";
import ViewTnx from "./CoinTnx.jsx/ViewTnx";
import ViewUser from "./User/ViewUser";
import BizView from "./BizView/BizView";
import ViewLead from "./Lead/ViewLead";
import CreatePaymentMethod from "./PaymentMethod/CreatePaymentMethod";
import ViewPaymentMethod from "./PaymentMethod/ViewPaymentMethod";
import CreateCommunity from "./Community/CreateCommunity";
import ViewCommunity from "./Community/ViewCommunity";
import CreateAdvancePay from "./AdvancePay/CreateAdvancePay";
import ViewAdvancePay from "./AdvancePay/ViewAdvancePay";
import CreateBanner from "./Banner/CreateBanner";
import ViewBanner from "./Banner/ViewBanner";
import OfferManagement from "./SpecialForYou/OfferManagement";
import PrescriptionManagement from "./Prescription/PrescriptionManagement";
import LabTestManagement from "./LabTest/LabTestManagement";
import HeaderFooterSettings from "./HeaderFooterSettings";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState(searchParams.get('menu') || "dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const userRole = localStorage.getItem("type");

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    setIsOverlayVisible(newState);
  };

  const handleOverlayClick = () => {
    toggleSidebar();
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('menu', selectedMenu);
    setSearchParams(params);
  }, [selectedMenu, setSearchParams]);

  useEffect(() => {
    const menuParam = searchParams.get('menu');
    if (menuParam) {
      setSelectedMenu(menuParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
        setIsOverlayVisible(false);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAccess = (menuKey) => {
    const accessRules = {
      admin: [
        // All admin accessible menus
        "dashboard",
        "createHome", "homeOverview", "createLegal", "legalOverview", 
        "createContact", "contactOverview", "createContactInfo", "contactInfoOverview",
        "createMenu", "menuOverview", "createSocial", "socialOverview", "createLogo",
        "logoOverview", "createCategory", "categoryOverview", "createSize", "sizeOverview",
        "createDeliveryCharge", "deliveryChargeOverview", "createPixel", "PixelOverview",
        "createSteadfast", "steadfastOverview", "createProductPage", "productPageOverview",
        "createColor", "colorOverview", "createProduct", "productOverview", "createCongrates",
        "congratesOverview", "createForm", "formOverview", "customerOverview", 
        "transactionOverview", "usersOverview", "dashboard", "createCoin", "coinOverview",
        "createPackage", "packageOverview", "createTnx", "tnxOverview","leadOverview","createPaymentMethod",
        "paymentMethodOverview", "createCommunity", "communityOverview", "createAdvancePay", "advancePayOverview",
        "createBanner", "bannerOverview","OfferManagement","PrescriptionManagement", "LabTestManagement",
        "headerFooterSettings"
      ],
      moderator: [
        // Moderator specific access
        "categoryOverview", "productOverview", "customerOverview", "dashboard",
        "createCategory", "createProduct", "contactOverview", "createSteadfast", "steadfastOverview", 
        "createTnx", "tnxOverview","createCoin", "coinOverview","leadOverview", "createCommunity", "communityOverview","createBanner", "bannerOverview","OfferManagement",
        "headerFooterSettings"
      ],
      user: ["dashboard"] // Basic user access
    };

    return accessRules[userRole]?.includes(menuKey) || false;
  };

  const renderContent = () => {
    if (!checkAccess(selectedMenu)) {
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-red-600">Access Denied</h3>
          <p>You don't have permission to access this page</p>
          <button 
            onClick={() => setSelectedMenu("dashboard")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    switch (selectedMenu) {
      case "createHome":
        return <CreateHome onHomeCreated={() => setSelectedMenu('homeOverview')} />;
      case "homeOverview":
        return <ViewHome />;
      case "createLegal":
        return <CreateLegal onLegalCreated={() => setSelectedMenu('legalOverview')} />;
      case "legalOverview":
        return <ViewLegal />;
      case "createContact":
        return <CreateContact onContactCreated={() => setSelectedMenu('contactOverview')} />;
      case "contactOverview":
        return <ViewContact />;
      case "createContactInfo":
        return <CreateContactInfo onContactInfoCreated={() => setSelectedMenu('contactInfoOverview')} />;
      case "contactInfoOverview":
        return <ViewContactInfo />;
      case "createMenu":
        return <CreateMenu onMenuCreated={() => setSelectedMenu('menuOverview')} />;
      case "menuOverview":
        return <ViewMenu onAddNewMenu={() => setSelectedMenu('createMenu')} />;
      case "createSocial":
        return <CreateSocial onSocialCreated={() => setSelectedMenu('socialOverview')} />;
      case "socialOverview":
        return <ViewSocial />;
      case "createLogo":
        return <CreateWebsiteLogo onLogoCreated={() => setSelectedMenu('logoOverview')} />;
      case "logoOverview":
        return <ViewWebsiteLogo />;
      case "createCategory":
        return <CreateCategory onCategoryCreated={() => setSelectedMenu('categoryOverview')} />;
      case "createCoin":
        return <CreateBonus onCoinCreated={() => setSelectedMenu('coinOverview')} />;
      case "coinOverview":
        return <ViewBonus />;
      case "createPackage":
        return <CreatePackage onPackageCreated={() => setSelectedMenu('packageOverview')} />;
      case "packageOverview":
        return <ViewPackage />;
      case "createTnx":
        return <CreateTnx onTnxCreated={() => setSelectedMenu('tnxOverview')} />;
      case "tnxOverview":
        return <ViewTnx />;
      case "categoryOverview":
        return <ViewCategory />;
      case "createSize":
        return <CreateSize onSizeCreated={() => setSelectedMenu('sizeOverview')} />;
      case "sizeOverview":
        return <ViewSize />;
      case "createDeliveryCharge":
        return <CreateDeliveryCharge onDeliveryChargeCreated={() => setSelectedMenu('deliveryChargeOverview')} />;
      case "deliveryChargeOverview":
        return <ViewDeliveryCharge />;
      case "createPixel":
        return <CreatePixel onPixelCreated={() => setSelectedMenu('PixelOverview')} />;
      case "PixelOverview":
        return <ViewPixel />;
      case "createPaymentMethod":
        return <CreatePaymentMethod onPaymentCreated={() => setSelectedMenu('paymentMethodOverview')} />;
      case "paymentMethodOverview":
        return <ViewPaymentMethod />;
      case "createSteadfast":
        return <CreateSteadfast onSteadfastCreated={() => setSelectedMenu('steadfastOverview')} />;
      case "steadfastOverview":
        return <ViewStedfast />;
      case "createProductPage":
        return <CreateProductPage onProductPageCreated={() => setSelectedMenu('productPageOverview')} />;
      case "productPageOverview":
        return <ViewProductPage />;
      case "createColor":
        return <CreateColor onColorCreated={() => setSelectedMenu('colorOverview')} />;
      case "colorOverview":
        return <ViewColor />;
      case "createProduct":
        return <CreateProduct onProductCreated={() => setSelectedMenu('productOverview')} />;
      case "productOverview":
        return <ViewProduct />;
      case "createCongrates":
        return <CreateCongratulation onCongratesCreated={() => setSelectedMenu('congratesOverview')} />;
      case "congratesOverview":
        return <ViewCongratulation />;
      case "createForm":
        return <CreateForm onFormCreated={() => setSelectedMenu('formOverview')} />;
      case "formOverview":
        return <ViewForm />;

      case "createCommunity":
        return <CreateCommunity onCommunityCreated={() => setSelectedMenu('communityOverview')} />;
      case "communityOverview":
        return <ViewCommunity />;

      case "createBanner":
        return <CreateBanner onBannerCreated={() => setSelectedMenu('bannerOverview')} />;
      case "bannerOverview":
        return <ViewBanner />;

      case "createAdvancePay":
        return <CreateAdvancePay onCodAdvanceCreated={() => setSelectedMenu('advancePayOverview')} />;
      case "advancePayOverview":
        return <ViewAdvancePay />;

      case "customerOverview":
        return <ViewCustomer />;
      case "leadOverview":
        return <ViewLead />;
      case "transactionOverview":
        return <ViewTransaction />;
      case "usersOverview":
        return <ViewUser />;
      case "dashboard":
        return <BizView />;
      case "OfferManagement":
        return <OfferManagement />;
      case "PrescriptionManagement":
        return <PrescriptionManagement />;

      case "LabTestManagement":
        return <LabTestManagement />;
      case "headerFooterSettings":
        return <HeaderFooterSettings />;
      default:
        return <div className="text-gray-700 p-4"><BizView /></div>;
    }
  };

  return (
    <PrivateRoute allowedRoles={["admin", "moderator", "user"]}>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        {isOverlayVisible && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
    
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          toggleSidebar={toggleSidebar}
        />

        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        } pt-16`}>
          <div className="p-4 md:p-6 max-w-[96rem] mx-auto h-screen overflow-y-auto">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
};

export default Dashboard;
