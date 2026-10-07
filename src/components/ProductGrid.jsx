import React from 'react';

const columnClassMap = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

const ProductGrid = ({ columns = 5, className = '', children }) => {
  const desktopColumnsClass = columnClassMap[columns] || columnClassMap[5];

  return (
    <div
      className={`grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 ${desktopColumnsClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ProductGrid;
