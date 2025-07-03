import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function RegisterPage(){
    const [form, setForm] = useState({name: '', username: '', password:''});
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'
    const navigate = useNavigate();

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleRegister = async e =>{
        e.preventDefault();
        try {
            await axios.post("/api/auth/register", form);
            showMessage("You have successfully registered!", 'success');
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            showMessage("Error registering", 'error');
            console.log(error);
        }
    };
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
            {message && (
                <div className={`mb-2 w-full text-center py-2 rounded font-semibold ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{message}</div>
            )}
            <input 
              name="username" 
              onChange={e => setForm({...form, [e.target.name]:e.target.value})}
              placeholder="Username"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="username"
              required
            />
            <input
              name="name"
              onChange={e => setForm({...form, [e.target.name]: e.target.value})}
              placeholder="Name"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="name"
              required
            />
            <input 
              name="password" 
              type="password"
              onChange={e => setForm({...form,[e.target.name]:e.target.value})}
              placeholder="Password"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="new-password"
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-colors duration-200"
            >
              Register
            </button>
          </form>
        </div>
    );
}