import React, { useContext } from 'react';
import { HeaderContext } from '../context/HeaderContext';
import { handleImageFallback } from '../utils/image';

const AppLogo = ({ className = '', alt = 'Logo' }) => {
  const { logo, loading } = useContext(HeaderContext);

  if (loading) {
    return <div className="w-24 h-8 bg-gray-200 animate-pulse rounded" />;
  }

  const src =
    logo?.logo
      ? logo.logo
      : '/medivila-logo.png';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageFallback}
    />
  );
};

export default AppLogo;