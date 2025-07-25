import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", username: "" , tier: ""});
  const [form, setForm] = useState({ name: "", username: "" , tier: ""});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load user details from backend
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/user/you');
      setUser(res.data);
      setForm({ name: res.data.name, username: res.data.username , tier: res.data.tier});
    } catch (err) {
      setUser({ name: "", username: "" , tier: ""});
      setForm({ name: "", username: "" , tier: ""});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const nameChanged = form.name !== user.name;
    const tierChanged = form.tier !== user.tier;
    if (!nameChanged && !tierChanged) {
      setError("No changes detected.");
      setSaving(false);
      return;
    }
    try {
      if (nameChanged) {
        await axios.put('/api/user/change-name', form, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      if (tierChanged) {
        await axios.put('/api/user/change-tier', { tier: form.tier }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      setSuccess(true);
      loadUser();
    } catch (error) {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data &&
        typeof error.response.data === 'string' &&
        error.response.data.includes('Basic feature not available for free users')
      ) {
        setError('This feature is not available for FREE users.');
      } else if (error.response && error.response.status === 403) {
        setError('You do not have permission to perform this action.');
      } else {
        setError("Failed to update profile. Please try again.");
      }
      // Only log unexpected errors
      if (!error.response || error.response.status !== 403) {
        console.log(error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900">
      <div className="bg-gray-900 bg-opacity-95 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center border border-green-800 animate-pulse">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-900 mb-2 border-4 border-green-500"></div>
          <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="h-10 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-10 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-10 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-12 bg-green-700 rounded w-full mt-2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex flex-col items-center justify-center px-2 py-8">
      <div className="bg-gray-900 bg-opacity-95 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center border border-green-800">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-green-900 flex items-center justify-center text-4xl font-bold text-green-400 mb-2 border-4 border-green-500">
            {user.username && user.username[0].toUpperCase()}
          </div>
          <div className="text-xl font-semibold text-green-400">{user.username}</div>
        </div>
        <form onSubmit={handleSave} className="w-full flex flex-col gap-4">
          <label className="text-gray-200 font-medium">Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              required
              disabled={saving}
            />
          </label>
          <label className="text-gray-200 font-medium">Username
            <input
              name="username"
              value={form.username}
              readOnly
              className="mt-1 border border-green-700 bg-gray-800 text-green-400 rounded px-3 py-2 w-full cursor-not-allowed focus:outline-none"
            />
          </label>
          <label className="text-gray-200 font-medium">Tier
            <select
              name="tier"
              value={form.tier}
              onChange={handleChange}
              disabled={saving}
              className="mt-1 border border-green-700 bg-gray-800 text-green-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </label>
          <button
            type="submit"
            className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-all duration-200 mt-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {success && <div className="text-green-400 text-center font-semibold">Profile updated!</div>}
          {error && <div className="text-red-400 text-center font-semibold">{error}</div>}
        </form>
      </div>
    </div>
  );
} 