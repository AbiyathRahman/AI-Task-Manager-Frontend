import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedLayout() {
  const isLoggedIn = !!localStorage.getItem("token");
  if (!isLoggedIn) return <Navigate to="/login" />;
  return (
    <div>
      <Outlet />
    </div>
  );
} 