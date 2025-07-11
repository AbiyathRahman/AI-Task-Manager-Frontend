import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-900 bg-opacity-80 shadow-md border-b border-green-700 flex items-center justify-between px-6 py-4 mb-6 backdrop-blur transition-all duration-500">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-extrabold text-green-400 tracking-tight drop-shadow-lg">InsightPulse</span>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-lg font-semibold px-3 py-1 rounded transition-all duration-300 ${
              isActive
                ? "bg-green-900 text-green-400"
                : "text-gray-200 hover:text-green-400 hover:bg-gray-800"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `text-lg font-semibold px-3 py-1 rounded transition-all duration-300 ${
              isActive
                ? "bg-green-900 text-green-400"
                : "text-gray-200 hover:text-green-400 hover:bg-gray-800"
            }`
          }
        >
          Settings
        </NavLink>
      </div>
      <button
        onClick={handleLogout}
        className="text-red-400 hover:text-red-300 font-semibold text-lg px-4 py-2 rounded transition-all duration-300 border border-red-700 bg-red-900 hover:bg-red-800"
      >
        Logout
      </button>
    </nav>
  );
} 