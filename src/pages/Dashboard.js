import axios from "../api/axios";
import { useEffect, useState } from "react";

export default function Dashboard(){
    const [tasks, setTasks] = useState([]);

    const loadTask = async () => {
        const res = await axios.get('/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(( ) => {loadTask();}, []);

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

        </div>

    );
}