import axios from "../api/axios";
import { useEffect, useState } from "react";

export default function Dashboard(){
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});

    const loadTask = async () => {
        const res = await axios.get('/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(( ) => {loadTask();}, []);

    const handleChange = e => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('/task/create', form, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert('Task created successfully');
            setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''}); // Reset form
        loadTask();



            
        } catch (error) {
            console.log(error);
            alert('error creating task');
            
        }
    }

    return(
        <div>
            <h2>Your Tasks</h2>
            <ul>
                {tasks.map(t => (
                    <li key={t.id}>
                        <b>{t.taskName}</b> - {t.taskDescription}
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
            <h2>Create Tasks</h2>
            <input name="taskName" onChange={handleChange} placeholder="task name"></input>
            <input name="taskDescription" onChange={handleChange} placeholder="task description"></input>
            <input name="taskStatus" onChange={handleChange} placeholder="task status"></input>
            <input name="taskPriority" onChange={handleChange} placeholder="task priority"></input>
            <input name="taskDueDate" onChange={handleChange} placeholder="task due date"></input>
            <button type="submit">Create</button>
            </form>

        </div>

    );
}