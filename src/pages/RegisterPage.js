import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-green-900">
          <form onSubmit={handleRegister} className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4 border border-green-800">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400 drop-shadow-lg">Register</h2>
            {message && (
                <div className={`mb-2 w-full text-center py-2 rounded font-semibold ${messageType === 'success' ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'}`}>{message}</div>
            )}
            <input 
              name="username" 
              onChange={e => setForm({...form, [e.target.name]:e.target.value})}
              placeholder="Username"
              className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoComplete="username"
              required
            />
            <input
              name="name"
              onChange={e => setForm({...form, [e.target.name]: e.target.value})}
              placeholder="Name"
              className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoComplete="name"
              required
            />
            <input 
              name="password" 
              type="password"
              onChange={e => setForm({...form,[e.target.name]:e.target.value})}
              placeholder="Password"
              className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              autoComplete="new-password"
              required
            />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Register
            </button>
            {message && <div className="text-red-400 text-center font-semibold">{message}</div>}
            <div className="text-center mt-6">
              <p className="text-gray-300">Already have an account?</p>
              <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold underline hover:no-underline transition-all duration-200">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
    );
}