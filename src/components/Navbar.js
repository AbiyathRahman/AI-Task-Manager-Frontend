import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white bg-opacity-90 shadow flex items-center justify-between px-6 py-4 mb-6">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight">InsightPulse</span>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-lg font-semibold px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-700'}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `text-lg font-semibold px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-700'}`
          }
        >
          Settings
        </NavLink>
      </div>
      <button
        onClick={handleLogout}
        className="text-red-500 hover:text-red-700 font-semibold text-lg px-4 py-2 rounded transition-colors duration-200 border border-red-200 bg-red-50"
      >
        Logout
      </button>
    </nav>
  );
} 