import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("type"); // 'admin', 'moderator', 'user'

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to dashboard home if unauthorized
    return <Navigate to="/dashboard?menu=dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;