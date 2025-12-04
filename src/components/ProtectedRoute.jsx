import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PermissionGate from "./PermissionGate";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token } = useSelector((state) => state.auth);

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <PermissionGate />;
  }

  return children;
}
