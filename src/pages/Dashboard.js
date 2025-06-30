import axios from "../api/axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const loadTask = async () => {
        const res = await axios.get('/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(() => {loadTask();}, []);

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
    const handleDelete = async (task) => {
        try {
            await axios.delete(`/task/${task.id}`);
            alert("Deleted successfully")
        } catch (error) {
            console.log(error)
            alert(`error deleting task ${task.id}`);
        }
        loadTask();
    }

    const handleCancel = () => {
        // Reset form and states
        setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
        setIsUpdate(false);
        setSelectedTaskId(null);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 py-2 px-2">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Task List */}
                <div className="flex-1 bg-white bg-opacity-90 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">Your Tasks</h2>
                    {tasks.length === 0 ? (
                        <p className="text-gray-500">No tasks yet. Add one!</p>
                    ) : (
                        <ul className="space-y-4">
                            {tasks.map(t => (
                                <li key={t.id} className="flex flex-col md:flex-row md:items-center justify-between bg-blue-50 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="font-semibold text-lg text-blue-800">{t.taskName}</div>
                                        <div className="text-gray-700 mb-1">{t.taskDescription}</div>
                                        <div className="text-xs text-gray-500">Priority: <span className="font-medium">{t.taskPriority}</span> | Status: <span className="font-medium">{t.taskStatus}</span> | Due: <span className="font-medium">{t.taskDueDate}</span></div>
                                    </div>
                                    <div className="flex gap-2 mt-2 md:mt-0">
                                        <button onClick={() => handleUpdate(t)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded transition-colors duration-200 font-semibold shadow-sm">✏️ Update</button>
                                        <button onClick={() => handleDelete(t)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors duration-200 font-semibold shadow-sm">🗑️ Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Task Form */}
                <div className="flex-1 bg-white bg-opacity-90 rounded-xl shadow-lg p-6 flex flex-col justify-center">
                    <h2 className={`text-2xl font-bold mb-6 text-center ${isUpdate ? 'text-yellow-600' : 'text-blue-700'}`}>{isUpdate ? 'Update Task' : 'Create Task'}</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            name="taskName"
                            value={form.taskName}
                            onChange={handleChange}
                            placeholder="Task name"
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        <input
                            name="taskDescription"
                            value={form.taskDescription}
                            onChange={handleChange}
                            placeholder="Task description"
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        <div className="flex gap-4">
                            <select
                                name="taskStatus"
                                value={form.taskStatus}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-1/2"
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="INPROGRESS">In Progress</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                            <select
                                name="taskPriority"
                                value={form.taskPriority}
                                onChange={handleChange}
                                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-1/2"
                                required
                            >
                                <option value="">Select Priority</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <input
                            name="taskDueDate"
                            value={form.taskDueDate}
                            onChange={handleChange}
                            placeholder="Due date (YYYY-MM-DD)"
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            type="date"
                            required
                        />
                        <div className="flex gap-2 justify-center mt-2">
                            <button
                                type="submit"
                                className={`${isUpdate ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold py-2 px-6 rounded transition-colors duration-200`}
                            >
                                {isUpdate ? 'Update' : 'Create'}
                            </button>
                            {isUpdate && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}