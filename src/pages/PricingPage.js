import React from "react";
import { Link } from "react-router-dom";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Get started with essential features.",
      features: [
        "Task Management",
        "5 Claude AI Summaries/month",
        "Community support"
      ],
      cta: "Get Started",
      highlight: false,
      to: "/register"
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      description: "Unlock more productivity and insights.",
      features: [
        "Everything in Free",
        "Unlimited Claude AI Summaries",
        "Google Calendar Sync",
        "Weekly Productivity Email",
        "Pomodoro + Break Recommendations",
        "Priority Support"
      ],
      cta: "Upgrade to Pro",
      highlight: true,
      to: "/register"
    },
    {
      name: "Team",
      price: "$19",
      period: "/mo",
      description: "For teams and organizations.",
      features: [
        "Everything in Pro",
        "Shared Workspace",
        "Role-Based Access Control",
        "Admin Billing Dashboard"
      ],
      cta: "Go Team",
      highlight: false,
      to: "/register"
    }
  ];

  const featureComparison = [
    {
      feature: "Task Management",
      free: "✅",
      pro: "✅",
      team: "✅"
    },
    {
      feature: "Claude AI Summaries (v2.1)",
      free: "5/month",
      pro: "Unlimited",
      team: "Unlimited"
    },
    {
      feature: "Google Calendar Sync",
      free: "❌",
      pro: "✅",
      team: "✅"
    },
    {
      feature: "Weekly Productivity Email",
      free: "❌",
      pro: "✅",
      team: "✅"
    },
    {
      feature: "Pomodoro + Break Recommendations",
      free: "❌",
      pro: "✅",
      team: "✅"
    },
    {
      feature: "Shared Workspace",
      free: "❌",
      pro: "❌",
      team: "Coming Soon"
    },
    {
      feature: "Role-Based Access Control",
      free: "❌",
      pro: "❌",
      team: "Coming Soon"
    },
    {
      feature: "Admin Billing Dashboard",
      free: "❌",
      pro: "❌",
      team: "Coming Soon"
    },
    {
      feature: "Priority Support",
      free: "❌",
      pro: "✅",
      team: "✅"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-400 mb-4 drop-shadow-lg">Pricing Plans</h1>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">Choose the plan that fits your productivity needs. No credit card required for Free. Upgrade anytime.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`flex flex-col items-center bg-gray-900 bg-opacity-95 rounded-2xl shadow-xl border-2 transition-all duration-300 p-8 relative ${
                plan.highlight
                  ? "border-green-500 scale-105 z-10 shadow-2xl"
                  : "border-gray-700 hover:border-green-500 hover:scale-105"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-wider">Most Popular</div>
              )}
              <h2 className="text-2xl font-bold text-green-400 mb-2">{plan.name}</h2>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-lg text-gray-400 ml-1">{plan.period}</span>
              </div>
              <p className="text-gray-300 mb-6 text-center">{plan.description}</p>
              <ul className="mb-8 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-200 mb-2">
                    <span className="text-green-400">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`w-full text-center py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  plan.highlight
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-800 hover:bg-green-700 text-green-400 border border-green-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-gray-900 bg-opacity-95 rounded-2xl shadow-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-green-400 mb-8 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-300 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-gray-300 font-semibold">Pro</th>
                  <th className="text-center py-4 px-4 text-gray-300 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 text-gray-200 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={row.free === "✅" ? "text-green-400" : row.free === "❌" ? "text-red-400" : "text-gray-300"}>
                        {row.free}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={row.pro === "✅" ? "text-green-400" : row.pro === "❌" ? "text-red-400" : "text-gray-300"}>
                        {row.pro}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={
                        row.team === "✅" ? "text-green-400" : 
                        row.team === "❌" ? "text-red-400" : 
                        row.team === "Coming Soon" ? "text-yellow-400 text-sm" : "text-gray-300"
                      }>
                        {row.team}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 