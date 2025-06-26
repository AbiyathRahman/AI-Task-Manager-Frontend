import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage(){
    const [form, setForm] = useState({username: '', password: ''});
    const navigate = useNavigate();

    const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

    const handleLogin = async e => {
        e.preventDefault();
        try {

            const res = await axios.post('/auth/login', form);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");

            
        } catch (error) {
            alert("Login Failed");
            
        }
    };

    return(
        <form onSubmit={handleLogin}>
            <h2>Login Page</h2>
            <input name="username" onChange={handleChange} placeholder="username"></input>
            <input name="password" onChange={handleChange} placeholder="password"></input>
            <button type="submit">Login</button>
        </form>

    );
}