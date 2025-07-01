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
            const res = await axios.post('/auth/login', form);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (error) {
            setMessage("Login failed. Please check your credentials.");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
            {message && (
              <div className="mb-2 w-full text-center py-2 rounded font-semibold bg-red-100 text-red-700">{message}</div>
            )}
            <input 
              name="username" 
              onChange={handleChange} 
              placeholder="Username"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="username"
              required
            />
            <input 
              name="password" 
              type="password"
              onChange={handleChange} 
              placeholder="Password"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="current-password"
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors duration-200"
            >
              Login
            </button>
          </form>
        </div>
    );
}