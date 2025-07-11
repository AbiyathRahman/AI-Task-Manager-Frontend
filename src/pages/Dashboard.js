import axios from "../api/axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
    const [isUpdate, setIsUpdate] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'
    const [events, setEvents] = useState([]);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventInsight, setEventInsight] = useState('');
    const [eventInsightLoading, setEventInsightLoading] = useState(false);
    const [googleAuthCode, setGoogleAuthCode] = useState(null);



    const location = useLocation();

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    const getAuthUrl = async () => {
        try {
            const res = await axios.get('/api/calendar/auth-url');
            window.location.href = res.data.url;
        } catch (error) {
            console.log(error);
            showMessage('Error getting auth url', 'error');
        }
    };

    const fetchEvents = async (code) => {
        setEventsLoading(true);
        try {
            const res = await axios.get(`/api/calendar/events?code=${code}`);
            console.log('Events API response:', res.data);
            console.log('Events type:', typeof res.data);
            console.log('Is array:', Array.isArray(res.data));
            // Handle the response structure: {count: number, events: string[]}
            const eventsData = res.data.events || res.data;
            setEvents(eventsData);
            setIsGoogleConnected(true);
            // Store connection status and events in localStorage
            localStorage.setItem('googleCalendarConnected', 'true');
            localStorage.setItem('googleCalendarEvents', JSON.stringify(eventsData));
            showMessage('Google Calendar connected successfully!', 'success');
        } catch (error) {
            console.log(error);
            showMessage('Error fetching events', 'error');
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        if (code) {
            fetchEvents(code);
            setGoogleAuthCode(code);
            
            // Clear the URL parameters after processing
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search, fetchEvents]);

    // Check if user is already connected on page load
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const connected = localStorage.getItem('googleCalendarConnected');
                const storedEvents = localStorage.getItem('googleCalendarEvents');
                
                if (connected === 'true') {
                    setIsGoogleConnected(true);
                    // Load stored events if available
                    if (storedEvents) {
                        try {
                            const parsedEvents = JSON.parse(storedEvents);
                            setEvents(parsedEvents);
                        } catch (e) {
                            console.log('Error parsing stored events:', e);
                        }
                    }
                }
            } catch (error) {
                console.log('Error checking connection status:', error);
            }
        };
        checkConnection();
    }, []);

    const fetchInsight = async () => {
        setAiLoading(true);
        setAiInsight("");
        try {
            const res = await axios.get('/api/task/insights');
            console.log('AI Insight Response:', res.data);
            setAiInsight(res.data.content && res.data.content.text ? res.data.content.text : JSON.stringify(res.data.content || res.data));
        } finally {
            setAiLoading(false);
        }
    };

    const fetchEventInsight = async (code) => {
        setEventInsightLoading(true);
        setEventInsight("");
        try {
            const res = await axios.get(`/api/calendar/event-insights?code=${code}`);
            setEventInsight(res.data.content && res.data.content.text ? res.data.content.text : JSON.stringify(res.data.content || res.data));
        } catch (error) {
            console.log(error);
            showMessage('Error fetching event insights', 'error');
        } finally {
            setEventInsightLoading(false);
        }
    }

    const loadTask = async () => {
        const res = await axios.get('/api/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(() => {loadTask();}, []);

    const handleChange = e => setForm({...form, [e.target.name]:e.target.value});

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (isUpdate) {
                // Update existing task
                await axios.put(`/api/task/${selectedTaskId}`, form, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                showMessage('Task updated successfully', 'success');
            } else {
                // Create new task
                await axios.post('/api/task/create', form, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                showMessage('Task created successfully', 'success');
            }
            
            // Reset form and states
            setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
            setIsUpdate(false);
            setSelectedTaskId(null);
            loadTask();
            
        } catch (error) {
            console.log(error);
            showMessage(isUpdate ? 'Error updating task' : 'Error creating task', 'error');
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
            await axios.delete(`/api/task/${task.id}`);
            showMessage('Task deleted successfully', 'success');
        } catch (error) {
            console.log(error)
            showMessage(`Error deleting task ${task.id}`, 'error');
        }
        loadTask();
    }

    const handleCancel = () => {
        // Reset form and states
        setForm({taskName: '', taskDescription: '', taskPriority: '', taskStatus: '', taskDueDate: ''});
        setIsUpdate(false);
        setSelectedTaskId(null);
    }

    // Helper to render AI insight nicely
    function renderAiInsight() {
        if (!aiInsight) return null;
        let parsed;
        try {
            parsed = typeof aiInsight === 'string' ? JSON.parse(aiInsight) : aiInsight;
        } catch {
            parsed = aiInsight;
        }
        if (Array.isArray(parsed)) {
            return (
                <div className="space-y-3 mt-2 w-full">
                    {parsed.map((item, idx) => (
                        <div key={idx} className="bg-blue-50 rounded p-3 text-blue-900 whitespace-pre-line">
                            {item.text}
                        </div>
                    ))}
                </div>
            );
        }
        if (typeof parsed === 'object' && parsed.text) {
            return <div className="bg-blue-50 rounded p-3 text-blue-900 whitespace-pre-line mt-2 w-full">{parsed.text}</div>;
        }
        return <div className="bg-blue-50 rounded p-3 text-blue-900 whitespace-pre-line mt-2 w-full">{String(parsed)}</div>;
    }

    // Helper to format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 py-2 px-2">
            <div className="max-w-5xl mx-auto">
                {/* AI Insights Section */}
                <div className="flex flex-col items-start gap-2 mb-6">
                    <h2 className="text-2xl font-bold text-green-400 drop-shadow-lg">AI Insights</h2>
                    <button
                        onClick={() => fetchInsight(googleAuthCode)}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={aiLoading}
                    >
                        <span role="img" aria-label="AI Suggestion">💡</span> {aiLoading ? 'Generating...' : 'Get AI Suggestion'}
                    </button>
                    {aiLoading && <div className="text-green-400 font-semibold mt-2">Generating insight...</div>}
                    {aiInsight && renderAiInsight()}
                </div>
                {/* Event Insights Section */}
                <div className="flex flex-col items-start gap-2 mb-6">
                    <h2 className="text-2xl font-bold text-green-400 drop-shadow-lg">Event Insights</h2>
                    <button
                        onClick={() => fetchEventInsight(googleAuthCode)}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={eventInsightLoading}
                    >
                        <span role="img" aria-label="Event Insight">📅</span> {eventInsightLoading ? 'Generating...' : 'Get Event Insight'}
                    </button>
                    {eventInsightLoading && <div className="text-green-400 font-semibold mt-2">Generating event insight...</div>}
                    {eventInsight && (
                        <div className="w-full space-y-4 mt-2">
                            {(() => {
                                let parsed;
                                try {
                                    parsed = typeof eventInsight === 'string' ? JSON.parse(eventInsight) : eventInsight;
                                } catch {
                                    parsed = eventInsight;
                                }
                                if (Array.isArray(parsed)) {
                                    return parsed.map((item, idx) => (
                                        <div key={idx} className="bg-gray-800 border border-green-700 rounded-lg p-5 flex items-start gap-4 shadow-lg">
                                            <div className="text-3xl mt-1">💡</div>
                                            <div>
                                                <div className="font-bold text-green-300 mb-1">Insight {idx + 1}</div>
                                                <div className="text-green-100 whitespace-pre-line text-base leading-relaxed">{item.text}</div>
                                            </div>
                                        </div>
                                    ));
                                }
                                if (typeof parsed === 'object' && parsed.text) {
                                    return (
                                        <div className="bg-gray-800 border border-green-700 rounded-lg p-5 flex items-start gap-4 shadow-lg">
                                            <div className="text-3xl mt-1">💡</div>
                                            <div>
                                                <div className="font-bold text-green-300 mb-1">Event Insight</div>
                                                <div className="text-green-100 whitespace-pre-line text-base leading-relaxed">{parsed.text}</div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-gray-800 border border-green-700 rounded-lg p-5 flex items-start gap-4 shadow-lg">
                                        <div className="text-3xl mt-1">💡</div>
                                        <div className="text-green-100 whitespace-pre-line text-base leading-relaxed">{String(parsed)}</div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
                {message && (
                    <div className={`mb-4 w-full text-center py-2 rounded font-semibold ${messageType === 'success' ? 'bg-green-900 text-green-300 border border-green-700' : 'bg-red-900 text-red-300 border border-red-700'}`}>{message}</div>
                )}
                {/* Connect Google Calendar Button */}
                {!isGoogleConnected && (
                    <div className="mb-6 flex flex-col items-start gap-2">
                        <button
                            onClick={getAuthUrl}
                            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" className="inline-block"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.6 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 15.2 3 7.7 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.5 26.7 37.5 24 37.5c-6.1 0-10.7-4.1-12.5-9.6l-7 5.4C7.7 39.3 15.2 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.2 43.1 21 45 24 45c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/></g></svg>
                            Connect Google Calendar
                        </button>
                    </div>
                )}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Task List */}
                    <div className="flex-1 bg-gray-900 bg-opacity-95 rounded-xl shadow-lg p-6 border border-green-800">
                        <h2 className="text-2xl font-bold text-green-400 mb-4 drop-shadow-lg">Your Tasks</h2>
                        {tasks.length === 0 ? (
                            <p className="text-gray-400">No tasks yet. Add one!</p>
                        ) : (
                            <ul className="space-y-4">
                                {tasks.map(t => (
                                    <li key={t.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all border border-gray-700 hover:border-green-500">
                                        <div>
                                            <div className="font-semibold text-lg text-green-400">{t.taskName}</div>
                                            <div className="text-gray-300 mb-1">{t.taskDescription}</div>
                                            <div className="text-xs text-gray-400">Priority: <span className="font-medium">{t.taskPriority}</span> | Status: <span className="font-medium">{t.taskStatus}</span> | Due: <span className="font-medium">{t.taskDueDate}</span></div>
                                        </div>
                                        <div className="flex gap-2 mt-2 md:mt-0">
                                            <button onClick={() => handleUpdate(t)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded transition-all duration-200 font-semibold shadow-sm">✏️ Update</button>
                                            <button onClick={() => handleDelete(t)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition-all duration-200 font-semibold shadow-sm">🗑️ Delete</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Task Form */}
                    <div className="flex-1 bg-gray-900 bg-opacity-95 rounded-xl shadow-lg p-6 flex flex-col justify-center border border-green-800">
                        <h2 className={`text-2xl font-bold mb-6 text-center ${isUpdate ? 'text-yellow-400' : 'text-green-400'} drop-shadow-lg`}>{isUpdate ? 'Update Task' : 'Create Task'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                name="taskName"
                                value={form.taskName}
                                onChange={handleChange}
                                placeholder="Task name"
                                className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                                required
                            />
                            <input
                                name="taskDescription"
                                value={form.taskDescription}
                                onChange={handleChange}
                                placeholder="Task description"
                                className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                                required
                            />
                            <div className="flex gap-4">
                                <select
                                    name="taskStatus"
                                    value={form.taskStatus}
                                    onChange={handleChange}
                                    className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 w-1/2"
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
                                    className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 w-1/2"
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
                                className="border border-green-700 bg-gray-800 text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                                type="date"
                                required
                            />
                            <div className="flex gap-2 justify-center mt-2">
                                <button
                                    type="submit"
                                    className={`${isUpdate ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-6 rounded transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
                                >
                                    {isUpdate ? 'Update' : 'Create'}
                                </button>
                                {isUpdate && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="bg-gray-700 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-6 rounded transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Google Calendar Events Section */}
                {isGoogleConnected && (
                    <div className="mt-8 bg-gray-900 bg-opacity-95 rounded-xl shadow-lg p-6 border border-green-800">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2 drop-shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.6 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 15.2 3 7.7 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.5 26.7 37.5 24 37.5c-6.1 0-10.7-4.1-12.5-9.6l-7 5.4C7.7 39.3 15.2 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.2 43.1 21 45 24 45c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/></g></svg>
                                Google Calendar Events
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="text-sm text-green-400 font-medium">✓ Connected</div>
                                <button
                                    onClick={() => {
                                        setIsGoogleConnected(false);
                                        setEvents([]);
                                        localStorage.removeItem('googleCalendarConnected');
                                        localStorage.removeItem('googleCalendarEvents');
                                        showMessage('Google Calendar disconnected', 'success');
                                    }}
                                    className="text-xs text-red-400 hover:text-red-600 underline"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                        
                        {eventsLoading ? (
                            <div className="text-center py-8">
                                <div className="text-green-400 font-semibold">Loading events...</div>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400">No upcoming events found in your Google Calendar.</div>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {Array.isArray(events) ? events.map((event, index) => (
                                    <div key={index} className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-green-400 text-lg mb-1">
                                                    {event.split(' - ')[1] || 'Untitled Event'}
                                                </h3>
                                                <p className="text-green-300 text-sm">
                                                    📅 {formatDate(event.split(' - ')[0])}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400">Invalid events data received.</div>
                                        <div className="text-xs text-gray-500 mt-2">Debug: {JSON.stringify(events)}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}