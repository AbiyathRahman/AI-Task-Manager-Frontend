import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-lg flex flex-col items-center max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">Welcome to InsightPulse</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">Gain insights, track your progress, and unlock your potential with our powerful analytics platform.</p>
        <div className="flex items-center gap-4 w-full justify-center mt-2">
          <Link to="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow">
              Login
            </button>
          </Link>
          <span className="text-gray-400 font-semibold">or</span>
          <Link to="/register">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 border border-blue-300 shadow-none">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 