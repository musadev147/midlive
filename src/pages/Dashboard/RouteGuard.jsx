// components/RouteGuard.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouteGuard = ({ allowedRoles, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const type = localStorage.getItem('type');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const menu = queryParams.get('menu');

    // মেনু অনুযায়ী এক্সেস চেক
    if (menu) {
      const hasAccess = checkMenuAccess(menu, type);
      if (!hasAccess) {
        navigate('/dashboard?menu=default'); // বা unauthorized পেজে রিডাইরেক্ট করুন
      }
    }
  }, [location.search, type, navigate]);

  const checkMenuAccess = (menu, userType) => {
    const accessRules = {
      admin: ['createCategory', 'editCategory', 'deleteCategory', 'manageUsers'],
      moderator: ['createCategory', 'viewCategories', 'viewProducts', 'viewCustomers'],
      user: ['viewProfile']
    };

    return accessRules[userType]?.includes(menu);
  };

  if (!allowedRoles.includes(type)) {
    return null; // বা একটি লোডিং স্পিনার দেখান
  }

  return children;
};

export default RouteGuard;