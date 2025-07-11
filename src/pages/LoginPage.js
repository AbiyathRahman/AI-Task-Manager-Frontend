import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
    const [form, setForm] = useState({username: '', password: ''});
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

    const handleLogin = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', form);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (error) {
            setMessage("Login failed. Please check your credentials.");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-green-900">
          <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4 border border-green-800">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400 drop-shadow-lg">Login</h2>
            {message && (
              <div className="mb-2 w-full text-center py-2 rounded font-semibold bg-red-900 text-red-300 border border-red-700">{message}</div>
            )}
            <input 
              name="username" 
              onChange={handleChange} 
              placeholder="Username"
              className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoComplete="username"
              required
            />
            <input 
              name="password" 
              type="password"
              onChange={handleChange} 
              placeholder="Password"
              className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoComplete="current-password"
              required
            />
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
    );
}