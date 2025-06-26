import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function RegisterPage(){
    const [form, setForm] = useState({username: '', password:''});
    const navigate = useNavigate();


    const handleRegister = async e =>{
        e.preventDefault();
        try {
            await axios.post("/auth/register", form);
            alert("You have successfully registered!")
            navigate("/");
            
        } catch (error) {
            alert("Error registering");
            console.log(error);
            
        }
    };
    return(
        <form onSubmit={handleRegister}>
            <h2>Register Here!</h2>
            <input name="username" onChange={e => setForm({...form, [e.target.name]:e.target.value})}/>
            <input name="password" onChange={e => setForm({...form,[e.target.name]:e.target.value})}/>
            <button type="submit">Register</button>
        </form>

    );

}