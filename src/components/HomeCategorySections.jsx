import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ProductSection from './ProductSection';
import { config } from '../config';

const HomeCategorySections = ({ columns = 5 }) => {
  const apiUrl = config.apiUrl;
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/menus`);
        const homeMenus = (Array.isArray(response.data) ? response.data : [])
          .filter((menu) => String(menu.menu_type).toLowerCase() === 'home_page')
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        if (isMounted) {
          setMenus(homeMenus);
        }
      } catch (error) {
        console.error('Failed to load homepage menus:', error);
        if (isMounted) {
          setMenus([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMenus();

    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const homepageSections = useMemo(() => {
    return menus.filter((menu) => menu.category);
  }, [menus]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm">
        Loading homepage sections...
      </div>
    );
  }

  if (!homepageSections.length) {
    return null;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {homepageSections.map((menu) => (
        <ProductSection
          key={menu.id}
          category={menu.category}
          title={menu.name}
          columns={columns}
        />
      ))}
    </div>
  );
};

export default HomeCategorySections;
