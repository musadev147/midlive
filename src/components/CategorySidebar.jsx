import React, { useContext, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductsContext';
import { useNavigate } from 'react-router-dom';
import {
  FaAngleRight,
  FaAngleDown,
  FaBolt,
  FaChevronRight,
  FaFire,
} from 'react-icons/fa';
import { config } from '../config';
import { buildImageUrl, handleImageFallback } from '../utils/image';

const CategorySidebar = ({ onCategorySelect }) => {
  const imageUrl = config.imageUrl;
  const { categories = [], filterProductsByCategory, selectedCategory } =
    useContext(ProductContext);
  const navigate = useNavigate();

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const colorSchemes = [
    {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'text-red-500',
      gradient: 'from-red-400 to-pink-500',
    },
    {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'text-blue-500',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'text-green-500',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      icon: 'text-purple-500',
      gradient: 'from-purple-400 to-violet-500',
    },
    {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      icon: 'text-orange-500',
      gradient: 'from-orange-400 to-amber-500',
    },
    {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-300',
      icon: 'text-pink-500',
      gradient: 'from-pink-400 to-rose-500',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prevIndex) =>
        prevIndex === colorSchemes.length - 1 ? 0 : prevIndex + 1
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [colorSchemes.length]);

  const currentColor = colorSchemes[currentColorIndex];

  const mainCategories = categories.filter(
    (category) =>
      !category.parent_id ||
      category.parent_id === null ||
      Number(category.parent_id) === 0
  );

  const hasChildCategories = (category) => {
    return categories.some(
      (child) => Number(child.parent_id) === Number(category.id)
    );
  };

  const getChildCategories = (category) => {
    return categories.filter(
      (child) => Number(child.parent_id) === Number(category.id)
    );
  };

  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    e.stopPropagation();

    const targetSlug = category?.slug || category?.id;
    if (targetSlug) {
      navigate(`/category/${targetSlug}`);
    }

    if (onCategorySelect) {
      onCategorySelect();
    }
  };

  const handleFlashSale = (e) => {
    e.preventDefault();

    filterProductsByCategory(null);

    if (onCategorySelect) {
      onCategorySelect();
    }
  };

  const toggleSubmenu = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();

    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 custom-scrollbar">
        <button
          onClick={handleFlashSale}
          onMouseEnter={() => setHoveredCategory('flash-sale')}
          onMouseLeave={() => setHoveredCategory(null)}
          className={`flex items-center justify-between w-full px-3 py-3 mb-4 text-left rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-lg border-2 sm:px-4 sm:py-4 sm:mb-6 ${currentColor.border} ${currentColor.bg} relative overflow-hidden group`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${currentColor.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          ></div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 ${currentColor.bg.replace(
                  '100',
                  '300'
                )} rounded-full animate-float`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center space-x-2.5 sm:space-x-3">
            <div
              className={`relative ${currentColor.icon} transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}
            >
              <FaBolt className="animate-pulse text-lg sm:text-xl" />
              <div
                className={`absolute inset-0 ${currentColor.icon} blur-sm opacity-50 animate-ping`}
              ></div>
            </div>

            <div>
              <span className={`font-bold text-base ${currentColor.text} sm:text-lg`}>
                Flash Sale
              </span>
              <div className="mt-0.5 text-[11px] text-gray-600 transition-all duration-300 group-hover:text-gray-800 sm:mt-1 sm:text-xs">
                Limited Time Offers
              </div>
            </div>
          </div>

          <div
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${currentColor.text} ${currentColor.bg.replace(
              '100',
              '200'
            )} border ${currentColor.border} animate-bounce relative z-10`}
          >
            HOT
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>

        <ul className="space-y-1.5 pb-3 sm:space-y-2 sm:pb-4">
          {mainCategories.map((category, index) => {
            const hasChildren = hasChildCategories(category);
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = Number(selectedCategory) === Number(category.id);
            const childCategories = getChildCategories(category);
            const isHovered = hoveredCategory === category.id;

            return (
              <li
                key={category.id}
                className="border-b border-gray-100 last:border-b-0 animate-fade-in overflow-visible"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center justify-between group relative">
                  <button
                    onClick={(e) => handleCategoryClick(category, e)}
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex w-full items-center justify-start gap-2.5 px-2.5 py-2 text-left transition-all duration-300 rounded-xl relative overflow-hidden sm:gap-4 sm:px-3 sm:py-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold shadow-md scale-[1.02]'
                        : 'hover:bg-gray-50 text-gray-800 hover:shadow-md'
                    } ${hasChildren ? 'pr-10' : 'pr-3'}`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : ''
                      }`}
                    ></div>

                    <div
                      className={`absolute left-1.5 h-5 w-1 rounded-full bg-gradient-to-b from-green-400 to-blue-500 transition-all duration-500 sm:left-2 sm:h-6 ${
                        isSelected
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-8 opacity-0'
                      }`}
                    ></div>

                    <div
                      className={`relative z-10 transform transition-all duration-300 ${
                        isHovered ? 'scale-110 rotate-6' : ''
                      }`}
                    >
                      <img
                        src={buildImageUrl(imageUrl, category.image)}
                        alt={category.name}
                        className="h-5 w-5 rounded-full object-cover shadow-sm sm:h-6 sm:w-6"
                        onError={handleImageFallback}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-ping"></div>
                      )}
                    </div>

                    <span
                      className={`relative z-10 truncate text-sm transform transition-transform duration-300 sm:text-md ${
                        isHovered && !hasChildren ? 'translate-x-2' : ''
                      }`}
                    >
                      {category.name}
                    </span>

                    {!hasChildren && (
                      <div
                        className={`absolute right-3 transform transition-all duration-300 ${
                          isHovered
                            ? 'translate-x-0 opacity-100'
                            : 'translate-x-4 opacity-0'
                        }`}
                      >
                        <FaChevronRight className="text-gray-400 text-xs" />
                      </div>
                    )}
                  </button>

                  {hasChildren && (
                    <button
                      onClick={(e) => toggleSubmenu(category.id, e)}
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                        className={`mr-1 flex-shrink-0 rounded-lg p-1.5 transition-all duration-300 transform hover:scale-110 sm:p-2 ${
                        isSelected
                          ? 'bg-green-200 text-green-700 shadow-sm'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isExpanded ? (
                        <FaAngleDown className="text-[11px] sm:text-xs" />
                      ) : (
                        <FaAngleRight className="text-[11px] sm:text-xs" />
                      )}
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <ul className="bg-gradient-to-br from-gray-50 to-white ml-3 mt-1.5 mb-2 max-h-64 overflow-y-auto overflow-x-hidden rounded-r-lg border-l-2 border-green-200 custom-scrollbar-submenu sm:ml-6 sm:mt-2">
                    {childCategories.map((childCategory, childIndex) => {
                      const isChildSelected =
                        Number(selectedCategory) === Number(childCategory.id);
                      const isChildHovered = hoveredCategory === childCategory.id;

                      return (
                        <li
                          key={childCategory.id}
                          className="border-b border-gray-100 last:border-b-0 animate-fade-in"
                          style={{ animationDelay: `${childIndex * 0.05}s` }}
                        >
                          <button
                            onClick={(e) =>
                              handleCategoryClick(childCategory, e)
                            }
                            onMouseEnter={() =>
                              setHoveredCategory(childCategory.id)
                            }
                            onMouseLeave={() => setHoveredCategory(null)}
                            className={`flex w-full items-center justify-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-300 relative overflow-hidden sm:gap-3 sm:px-3 sm:py-2.5 ${
                              isChildSelected
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold scale-[1.02]'
                                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transform transition-all duration-300 ${
                                isChildHovered ? 'scale-150' : 'scale-100'
                              }`}
                            ></div>

                            <div
                              className={`transform transition-all duration-300 ${
                                isChildHovered ? 'scale-110' : ''
                              }`}
                            >
                              <img
                                src={buildImageUrl(imageUrl, childCategory.image)}
                                alt={childCategory.name}
                                className="h-4 w-4 rounded-full object-cover sm:h-5 sm:w-5"
                                onError={handleImageFallback}
                              />
                            </div>

                            <span
                               className={`flex-1 truncate text-xs transform transition-transform duration-300 sm:text-sm ${
                                isChildHovered ? 'translate-x-2' : ''
                              }`}
                            >
                              {childCategory.name}
                            </span>

                            <div
                              className={`transform transition-all duration-300 ${
                                isChildHovered
                                  ? 'translate-x-0 opacity-100'
                                  : 'translate-x-4 opacity-0'
                              }`}
                            >
                               <FaChevronRight className="text-[11px] text-gray-400 sm:text-xs" />
                             </div>

                             {childIndex < 3 && (
                               <FaFire className="ml-1 animate-pulse text-[10px] text-orange-500 sm:text-xs" />
                             )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
          {/* Static Wholesaler Menu Item */}
          <li className="border-b border-gray-100 last:border-b-0 animate-fade-in overflow-visible" style={{ animationDelay: `0.8s` }}>
             <div className="flex items-center justify-between group relative">
                <button
                  onClick={(e) => { e.preventDefault(); navigate('/wholesaler'); }}
                  onMouseEnter={() => setHoveredCategory('wholesaler')}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex w-full items-center justify-start gap-2.5 px-2.5 py-2 text-left transition-all duration-300 rounded-xl relative overflow-hidden sm:gap-4 sm:px-3 sm:py-3 hover:bg-gray-50 text-gray-800 hover:shadow-md pr-3`}
                >
                   <div className={`absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 ${hoveredCategory === 'wholesaler' ? 'opacity-100' : ''}`}></div>
                   <div className={`absolute left-1.5 h-5 w-1 rounded-full bg-gradient-to-b from-green-400 to-blue-500 transition-all duration-500 sm:left-2 sm:h-6 ${hoveredCategory === 'wholesaler' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}></div>

                   <div className={`relative z-10 transform transition-all duration-300 ${hoveredCategory === 'wholesaler' ? 'scale-110 rotate-6' : ''}`}>
                     <div className="h-5 w-5 rounded-full shadow-sm sm:h-6 sm:w-6 flex items-center justify-center text-[15px] overflow-hidden bg-gray-100">🏢</div>
                   </div>
                   <span className={`relative z-10 truncate text-sm transform transition-transform duration-300 sm:text-md ${hoveredCategory === 'wholesaler' ? 'translate-x-2' : ''}`}>
                     Wholesaler
                   </span>
                   <div className={`absolute right-3 transform transition-all duration-300 ${hoveredCategory === 'wholesaler' ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                      <FaChevronRight className="text-gray-400 text-xs" />
                   </div>
                </button>
             </div>
          </li>

          {/* Static Home Lab Test Menu Item */}
          <li className="border-b border-gray-100 last:border-b-0 animate-fade-in overflow-visible" style={{ animationDelay: `0.9s` }}>
             <div className="flex items-center justify-between group relative">
                <button
                  onClick={(e) => { e.preventDefault(); navigate('/home-lab'); }}
                  onMouseEnter={() => setHoveredCategory('home-lab')}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex w-full items-center justify-start gap-2.5 px-2.5 py-2 text-left transition-all duration-300 rounded-xl relative overflow-hidden sm:gap-4 sm:px-3 sm:py-3 hover:bg-gray-50 text-gray-800 hover:shadow-md pr-3`}
                >
                   <div className={`absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 ${hoveredCategory === 'home-lab' ? 'opacity-100' : ''}`}></div>
                   <div className={`absolute left-1.5 h-5 w-1 rounded-full bg-gradient-to-b from-green-400 to-blue-500 transition-all duration-500 sm:left-2 sm:h-6 ${hoveredCategory === 'home-lab' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}></div>

                   <div className={`relative z-10 transform transition-all duration-300 ${hoveredCategory === 'home-lab' ? 'scale-110 rotate-6' : ''}`}>
                     <div className="h-5 w-5 rounded-full shadow-sm sm:h-6 sm:w-6 flex items-center justify-center text-[15px] overflow-hidden bg-gray-100">🔬</div>
                   </div>
                   <span className={`relative z-10 truncate text-sm transform transition-transform duration-300 sm:text-md ${hoveredCategory === 'home-lab' ? 'translate-x-2' : ''}`}>
                     Home Lab Test
                   </span>
                   <div className={`absolute right-3 transform transition-all duration-300 ${hoveredCategory === 'home-lab' ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                      <FaChevronRight className="text-gray-400 text-xs" />
                   </div>
                </button>
             </div>
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.45s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .custom-scrollbar-submenu {
          scrollbar-width: thin;
          scrollbar-color: #86efac transparent;
        }

        .custom-scrollbar-submenu::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar-submenu::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar-submenu::-webkit-scrollbar-thumb {
          background: #86efac;
          border-radius: 9999px;
        }

        .custom-scrollbar-submenu::-webkit-scrollbar-thumb:hover {
          background: #4ade80;
        }
      `}</style>
    </div>
  );
};

export default CategorySidebar;

