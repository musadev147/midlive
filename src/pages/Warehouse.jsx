import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategorySidebar from "../components/CategorySidebar";
import { FaLayerGroup, FaTimes } from "react-icons/fa";

const Wholesaler = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.re;
    moveEventListener("resize", checkMobile);
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
            <div className="w-full bg-white rounded-xl p-8 mb-8 text-center border border-gray-200 shadow-sm mt-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Warehouse
              </h1>
              <p className="text-gray-600">
                Welcome to the warehouse section. Products and inventories are
                managed here.
              </p>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wholesaler;
