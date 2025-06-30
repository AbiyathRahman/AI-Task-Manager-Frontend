import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", username: "" });
  const [form, setForm] = useState({ name: "", username: "" });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load user details from backend
  const loadUser = async () => {
    try {
      const res = await axios.get('/user/you');
      setUser(res.data);
      setForm({ name: res.data.name, username: res.data.username });
    } catch (err) {
      // Optionally handle error
      setUser({ name: "", username: "" });
      setForm({ name: "", username: "" });
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
    try {
      await axios.put('/user/change-name', form, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setSuccess(true);
      loadUser();
    } catch (error) {
      setError("Failed to update name. Please try again.");
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200"><div className="text-blue-700 text-xl font-bold">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center px-2 py-8">
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-blue-700 mb-2">
            {user.username && user.username[0].toUpperCase()}
          </div>
          <div className="text-xl font-semibold text-blue-700">{user.username}</div>
        </div>
        <form onSubmit={handleSave} className="w-full flex flex-col gap-4">
          <label className="text-gray-700 font-medium">Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={saving}
            />
          </label>
          <label className="text-gray-700 font-medium">Username
            <input
              name="username"
              value={form.username}
              readOnly
              className="mt-1 border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors duration-200 mt-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {success && <div className="text-green-600 text-center font-semibold">Profile updated!</div>}
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        </form>
      </div>
    </div>
  );
} 