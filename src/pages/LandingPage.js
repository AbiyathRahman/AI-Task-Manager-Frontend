import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col">
      <header className="w-full py-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 text-center drop-shadow">Welcome to InsightPulse</h1>
        <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
          InsightPulse is your all-in-one productivity and analytics platform. Effortlessly manage your tasks, gain actionable AI-powered insights, and track your progress—all in a beautiful, intuitive interface. Whether you're a student, professional, or team, InsightPulse helps you stay organized and motivated.
        </p>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <Link to="/login" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow">
              Get Started
            </button>
          </Link>
          <Link to="/register" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 border border-blue-300 shadow-none">
              Register
            </button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-10">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mt-8">
          <div className="bg-blue-50 rounded-lg p-8 flex flex-col items-center shadow h-full">
            <span className="text-4xl mb-3">📊</span>
            <h3 className="font-bold text-blue-700 mb-2 text-lg">AI Insights</h3>
            <p className="text-gray-600 text-center text-base">Get personalized, actionable suggestions to boost your productivity and focus.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 flex flex-col items-center shadow h-full">
            <span className="text-4xl mb-3">✅</span>
            <h3 className="font-bold text-blue-700 mb-2 text-lg">Task Management</h3>
            <p className="text-gray-600 text-center text-base">Easily create, update, and organize your tasks by priority, status, and due date.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 flex flex-col items-center shadow h-full">
            <span className="text-4xl mb-3">📈</span>
            <h3 className="font-bold text-blue-700 mb-2 text-lg">Progress Tracking</h3>
            <p className="text-gray-600 text-center text-base">Visualize your progress and stay motivated with clear, insightful dashboards.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 flex flex-col items-center shadow h-full">
            <span className="text-4xl mb-3">🔒</span>
            <h3 className="font-bold text-blue-700 mb-2 text-lg">Secure & Private</h3>
            <p className="text-gray-600 text-center text-base">Your data is protected with secure authentication and privacy-first design.</p>
          </div>
        </section>
      </main>
    </div>
  );
} 