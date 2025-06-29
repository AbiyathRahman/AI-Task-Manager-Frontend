import axios from "../api/axios";
import { useEffect, useState } from "react";

export default function Dashboard(){
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const loadTask = async () => {
        const res = await axios.get('/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(( ) => {loadTask();}, []);

    const handleChange = e => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (isUpdate) {
                // Update existing task
                await axios.put(`/task/${selectedTaskId}`, form, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert('Task updated successfully');
            } else {
                // Create new task
                await axios.post('/task/create', form, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert('Task created successfully');
            }
            
            // Reset form and states
            setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
            setIsUpdate(false);
            setSelectedTaskId(null);
            loadTask();
            
        } catch (error) {
            console.log(error);
            alert(isUpdate ? 'Error updating task' : 'Error creating task');
        }
    }

    const handleUpdate = (task) => {
        // Fill the form with the selected task's data
        setForm({
            taskName: task.taskName,
            taskDescription: task.taskDescription,
            taskPriority: task.taskPriority,
            taskStatus: task.taskStatus,
            taskDueDate: task.taskDueDate
        });
        setIsUpdate(true);
        setSelectedTaskId(task.id);
    }

    const handleCancel = () => {
        // Reset form and states
        setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
        setIsUpdate(false);
        setSelectedTaskId(null);
    }

    return(
        <div>
            <h2>Your Tasks</h2>
            <ul>
                {tasks.map(t => (
                    <li key={t.id}>
                        <b>{t.taskName}</b> - {t.taskDescription}
                        <button onClick={() => handleUpdate(t)}>Update</button>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
            <h2>{isUpdate ? 'Update Task' : 'Create Task'}</h2>
            <input name="taskName" value={form.taskName} onChange={handleChange} placeholder="task name"></input>
            <input name="taskDescription" value={form.taskDescription} onChange={handleChange} placeholder="task description"></input>
            <input name="taskStatus" value={form.taskStatus} onChange={handleChange} placeholder="task status"></input>
            <input name="taskPriority" value={form.taskPriority} onChange={handleChange} placeholder="task priority"></input>
            <input name="taskDueDate" value={form.taskDueDate} onChange={handleChange} placeholder="task due date"></input>
            <button type="submit">{isUpdate ? 'Update' : 'Create'}</button>
            {isUpdate && <button type="button" onClick={handleCancel}>Cancel</button>}
            </form>

        </div>

    );
}