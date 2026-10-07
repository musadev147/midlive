import React, { useContext, useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryProducts from './CategoryProducts';
import Category from './Category';
import { ProductContext } from '../context/ProductsContext';
import { HeaderContext } from '../context/HeaderContext';
import BannerSlider from '../components/Home/BannerSlider';
import CategorySidebar from '../components/CategorySidebar';
import { FaTags, FaLayerGroup, FaHome, FaTimes } from 'react-icons/fa';
import SpecialForYou from '../components/SpecialForYou';
import LabTest from '../components/LabTest';
import SubCategorySlider from '../components/SubCategorySlider';
import HomeCategorySections from '../components/HomeCategorySections';
import { useProductScrollRestoration } from '../utils/scrollRestoration';

const ProductPage = () => {
  const {
    loading: productLoading,
    banners,
    selectedCategory,
    categories,
  } = useContext(ProductContext);

  const { loading: headerLoading } = useContext(HeaderContext);

  const [subCategories, setSubCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const childCategories = categories.filter(
        (cat) => Number(cat.parent_id) === Number(selectedCategory)
      );
      setSubCategories(childCategories);

      const currentCat = categories.find(
        (cat) => Number(cat.id) === Number(selectedCategory)
      );
      setCurrentCategory(currentCat || null);
    } else {
      setSubCategories([]);
      setCurrentCategory(null);
    }
  }, [selectedCategory, categories]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useProductScrollRestoration('/', !productLoading && !headerLoading, [
    productLoading,
    headerLoading,
    selectedCategory,
  ], { offset: 160 });

  if (productLoading || headerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

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

      {selectedCategory && (
        <div className="bg-white border-b border-gray-200 lg:mt-0 mt-16">
          <div className="container mx-auto px-4 lg:px-6 py-3">
            <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                <FaHome className="mr-2 flex-shrink-0" />
                Home
              </button>

              <span className="text-gray-400 flex-shrink-0">/</span>

              {currentCategory?.parent_id ? (
                <>
                  <span className="text-gray-600 whitespace-nowrap">
                    Parent Category
                  </span>
                  <span className="text-gray-400 flex-shrink-0">/</span>
                </>
              ) : null}

              <span className="text-green-600 font-semibold whitespace-nowrap">
                {currentCategory?.name || 'Products'}
              </span>

              {subCategories.length > 0 && (
                <>
                  <span className="text-gray-400 flex-shrink-0">/</span>
                  <span className="text-gray-500 whitespace-nowrap">
                    Subcategories
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row container mx-auto">
        <div
          className={`
            ${
              isMobile
                ? 'fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-50'
                : 'relative'
            }
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
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
                      <h2 className="text-base font-bold text-gray-800 sm:text-lg">Categories</h2>
                      <p className="text-xs text-gray-600 sm:text-sm">Browse by category</p>
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
                      <h2 className="font-bold text-gray-800 text-lg">Categories</h2>
                      <p className="text-gray-600 text-sm">Browse by category</p>
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

        <div className="flex-1 min-w-0 lg:mt-0 ">
          {!selectedCategory && (
            <div className="">
              <BannerSlider banners={banners} />
            </div>
          )}

          {!selectedCategory && (
            <div className="mb-0 sm:mb-4 lg:mb-8  lg:px-0">
              <LabTest />
            </div>
          )}

          {!selectedCategory && (
            <div className="mb-0 sm:mb-4 lg:mb-8 px-2 lg:px-0">
              <SpecialForYou />
            </div>
          )}

          {!selectedCategory && (
            <div className="mb-0 sm:mb-4 lg:mb-8 px-2 lg:px-0">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Category />
              </div>
            </div>
          )}

          {selectedCategory && subCategories.length > 0 && (
            <div className="mb-0 sm:mb-4 lg:mb-8 px-2 lg:px-0">
              <SubCategorySlider
                subCategories={subCategories}
                currentCategory={currentCategory}
              />
            </div>
          )}

          {selectedCategory ? (
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mx-2 lg:mx-0">
              <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaTags className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        {currentCategory?.name}
                      </h1>
                      <p className="text-gray-600 text-sm">
                        Discover amazing products in this category
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-sm text-gray-500">Products found</div>
                    <div className="text-lg font-semibold text-green-600"></div>
                  </div>
                </div>
              </div>

              <div className="p-1 lg:p-2">
                <CategoryProducts />
              </div>
            </div>
          ) : (
            <div className="mx-2 lg:mx-0">
              <HomeCategorySections />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
