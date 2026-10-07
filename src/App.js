import * as React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./pages/Dashboard/PrivateRoute";
import CustomCodeInjector from "./components/CustomCodeInjector";
import { gtmPageView } from "./utils/gtm";
import { ProductProvider } from "./context/ProductsContext";

const ThankYou = React.lazy(() => import("./pages/ThankYou"));
const Dashboard = React.lazy(() => import("./pages/Dashboard/Dashboard"));
const ProductPage = React.lazy(() => import("./pages/ProductPage"));
const Register = React.lazy(() => import("./pages/Dashboard/Register"));
const Login = React.lazy(() => import("./pages/Dashboard/Login"));
const SingleCategory = React.lazy(() => import("./pages/SingleCategory"));
const SearchResult = React.lazy(() => import("./pages/SearchResult"));
const OrderPage = React.lazy(() => import("./pages/OrderPage"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Shop = React.lazy(() => import("./pages/Shop"));
const LegalPage = React.lazy(() => import("./pages/LegalPage"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const HomeLab = React.lazy(() => import("./pages/HomeLab"));
const Wholesaler = React.lazy(() => import("./pages/Wholesaler"));
const TestDetails = React.lazy(() => import("./pages/TestDetails"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const DEFAULT_IMAGE_FALLBACK = "/medivila-default.jpg";

const GlobalImageFallback = () => {
  React.useEffect(() => {
    const handleImageError = (event) => {
      const target = event.target;

      if (!(target instanceof HTMLImageElement)) return;
      if (target.dataset.fallbackApplied === "true") return;

      target.dataset.fallbackApplied = "true";
      target.src = DEFAULT_IMAGE_FALLBACK;
    };

    document.addEventListener("error", handleImageError, true);

    return () => {
      document.removeEventListener("error", handleImageError, true);
    };
  }, []);

  return null;
};

const RouteTracker = () => {
  const location = useLocation();

  React.useEffect(() => {
    gtmPageView(window.location.href);
  }, [location]);

  return null;
};

function App() {
  return (
    <div className="App">
      <CustomCodeInjector />
      <Router>
        <ProductProvider>
          <GlobalImageFallback />
          <RouteTracker />
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-green-500"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProductPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/:slug" element={<OrderPage />} />
              <Route path="/thankyou/:id" element={<ThankYou />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="/category/:id" element={<SingleCategory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/home-lab" element={<HomeLab />} />
              <Route path="/test-details" element={<TestDetails />} />
              <Route path="/wholesaler" element={<Wholesaler />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={["admin", "moderator"]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </ProductProvider>
      </Router>
    </div>
  );
}

export default App;
