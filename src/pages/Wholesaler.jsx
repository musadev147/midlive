import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategorySidebar from "../components/CategorySidebar";
import ProductCard from "../components/ProductCard";
import { ProductContext } from "../context/ProductsContext";
import { FaLayerGroup, FaTimes } from "react-icons/fa";

const Wholesaler = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const { products } = useContext(ProductContext);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Header
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-col lg:flex-row container mx-auto lg:mt-6">
        <div
          className={`
            ${
              isMobile
                ? "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-50"
                : "relative"
            }
            ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
            w-80 lg:w-72 xl:w-80 flex-shrink-0 lg:mr-6 lg:block
          `}
        >
          <div className="sticky top-16 sm:top-20 lg:top-24 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] overflow-hidden rounded-2xl bg-white lg:bg-transparent">
            <div className="bg-white rounded-2xl shadow-lg lg:shadow-sm border border-gray-100 overflow-hidden h-full">
              {isMobile && (
                <div className="flex items-center justify-between border-b border-gray-200 p-3 lg:hidden sm:p-4">
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <div className="rounded-lg bg-green-100 p-1.5 sm:p-2">
                      <FaLayerGroup className="text-base text-green-600 sm:text-lg" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800 sm:text-lg">
                        Categories
                      </h2>
                      <p className="text-xs text-gray-600 sm:text-sm">
                        Browse by category
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeSidebar}
                    className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 sm:p-2"
                  >
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>
              )}

              {!isMobile && (
                <div className="p-4 lg:p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-xs">
                      <FaLayerGroup className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">
                        Categories
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Browse by category
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-full overflow-hidden">
                <CategorySidebar
                  onCategorySelect={isMobile ? closeSidebar : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 lg:mt-0">
          <main className="container mx-auto px-2 lg:px-0 py-0 max-w-7xl overflow-hidden">
            
            {/* Wholesaler Banner */}
            <div className="w-full h-[200px] sm:h-[280px] bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl mb-10 mt-4 sm:mt-6 relative overflow-hidden shadow-sm flex items-center justify-start px-6 sm:px-12 border border-indigo-500">
               <div className="z-10 text-left">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase rounded-full tracking-wider shadow-sm mb-4 inline-block">B2B Wholesale Portal</span>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 drop-shadow-md leading-tight">Medivila Wholesaler</h1>
                  <p className="text-xs sm:text-sm text-blue-100 mb-6 max-w-sm sm:max-w-md leading-relaxed">Source medicines, surgical items, and medical equipment in bulk directly from top manufacturers at trade prices.</p>
                  <button className="bg-white text-indigo-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-50 transition shadow-md text-sm sm:text-base">
                    Become a Wholesale Buyer
                  </button>
               </div>
               {/* Decorative background elements */}
               <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[200px] pointer-events-none transform rotate-12">📦</div>
               <div className="absolute right-[15%] top-[10%] w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
               <div className="absolute left-[40%] bottom-[-10%] w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-12">
               <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-2xl mb-4 group-hover:scale-110 transition transform duration-300">💊</div>
                  <span className="text-[13px] sm:text-sm font-bold text-gray-800">Medicines (Bulk)</span>
               </div>
               <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl mb-4 group-hover:scale-110 transition transform duration-300">✂️</div>
                  <span className="text-[13px] sm:text-sm font-bold text-gray-800">Surgical Items</span>
               </div>
               <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 text-2xl mb-4 group-hover:scale-110 transition transform duration-300">🔬</div>
                  <span className="text-[13px] sm:text-sm font-bold text-gray-800">Lab Reagents</span>
               </div>
               <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-2xl mb-4 group-hover:scale-110 transition transform duration-300">📑</div>
                  <span className="text-[13px] sm:text-sm font-bold text-gray-800">Request Quote</span>
               </div>
            </div>

            {/* Top Wholesale Deals */}
            <div className="mb-12 relative">
               <div className="flex justify-between items-center mb-5 px-2">
                 <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Featured Bulk Offers</h2>
                 <button 
                   onClick={() => setShowAllOffers(!showAllOffers)}
                   className="text-indigo-600 font-bold hover:underline text-sm"
                 >
                   {showAllOffers ? "Show Less" : "View All Offers"}
                 </button>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 px-2">
                  {products.slice(0, showAllOffers ? products.length : 12).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      scrollKey="/wholesaler"
                      addLabel="ADD TO QUOTE"
                    />
                  ))}
               </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 sm:p-12 mb-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center relative overflow-hidden">
               {/* Decorative background shapes */}
               <div className="absolute left-0 top-0 w-32 h-32 bg-indigo-50 rounded-br-full -z-10 opacity-50"></div>
               <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-50 rounded-tl-full -z-10 opacity-50"></div>
               
               <h2 className="text-2xl font-extrabold text-gray-900 mb-10">Why Source Wholesale From Us?</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center text-green-500 text-3xl mb-4 shadow-sm">🛡️</div>
                     <h3 className="font-bold text-gray-900 text-[15px] mb-2">100% Authentic Products</h3>
                     <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">Procured directly from certified manufacturers and authorized importers.</p>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-3xl mb-4 shadow-sm">💰</div>
                     <h3 className="font-bold text-gray-900 text-[15px] mb-2">Maximum Trade Margins</h3>
                     <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">Enjoy highly competitive B2B pricing, volume discounts, and special rebates.</p>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-3xl mb-4 shadow-sm">🚚</div>
                     <h3 className="font-bold text-gray-900 text-[15px] mb-2">Nationwide Logistics</h3>
                     <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">Fast, secure, and cold-chain compliant delivery across all districts.</p>
                  </div>
               </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="bg-indigo-600 rounded-3xl p-8 sm:p-10 mb-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-lg">
               <div className="mb-6 md:mb-0">
                 <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Ready to streamline your pharmacy supply?</h2>
                 <p className="text-indigo-100 text-sm">Join 500+ pharmacies sourcing inventory through Medivila.</p>
               </div>
               <button className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-md whitespace-nowrap">
                  Create Wholesale Account
               </button>
            </div>

          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wholesaler;
