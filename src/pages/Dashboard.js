import axios from "../api/axios";
import { useEffect, useState, useRef } from "react";
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
    const [isProcessingNewAuthCode, setIsProcessingNewAuthCode] = useState(false);
    const processedAuthCodes = useRef(new Set());
    const isFetchingEvents = useRef(false);
    const justCompletedFreshConnection = useRef(false);
    const [user, setUser] = useState({ name: "", username: "" });


    const location = useLocation();

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    const clearGoogleCalendarData = () => {
        setIsGoogleConnected(false);
        setGoogleAuthCode(null);
        setEvents([]);
        setIsProcessingNewAuthCode(false);
        processedAuthCodes.current = new Set();
        isFetchingEvents.current = false;
        justCompletedFreshConnection.current = false;
        localStorage.removeItem('googleCalendarConnected');
        localStorage.removeItem('googleCalendarEvents');
        localStorage.removeItem('googleAuthCode');
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
        // Prevent multiple simultaneous calls
        if (isFetchingEvents.current) {
            console.log('Already fetching events, skipping duplicate request');
            return;
        }
        
        isFetchingEvents.current = true;
        setEventsLoading(true);
        try {
            console.log('Fetching events with auth code:', code);
            const res = await axios.get(`/api/calendar/events?code=${code}`);
            console.log('Events API response:', res.data);
            console.log('Events type:', typeof res.data);
            console.log('Is array:', Array.isArray(res.data));
            // Handle the response structure: {count: number, events: string[]}
            const eventsData = res.data.events || res.data;
            setEvents(eventsData);
            setIsGoogleConnected(true);
            // Store connection status, events, and auth code in localStorage
            localStorage.setItem('googleCalendarConnected', 'true');
            localStorage.setItem('googleCalendarEvents', JSON.stringify(eventsData));
            localStorage.setItem('googleAuthCode', code);
            console.log('Stored auth code in localStorage:', code);
            showMessage('Google Calendar connected successfully!', 'success');
            
            // Mark that we just completed a fresh connection
            justCompletedFreshConnection.current = true;
            // Reset this flag after a short delay
            setTimeout(() => {
                justCompletedFreshConnection.current = false;
            }, 2000);
        } catch (error) {
            console.log(error);
            showMessage('Error fetching events', 'error');
        } finally {
            setEventsLoading(false);
            setIsProcessingNewAuthCode(false);
            // Reset the processing flag after we're done
            isFetchingEvents.current = false;
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        if (code && !processedAuthCodes.current.has(code) && !isFetchingEvents.current) {
            console.log('Processing new auth code:', code);
            setIsProcessingNewAuthCode(true);
            // When a new auth code is received, clear ALL old data first
            localStorage.removeItem('googleCalendarConnected');
            localStorage.removeItem('googleCalendarEvents');
            localStorage.removeItem('googleAuthCode');
            
            // Mark this auth code as processed
            processedAuthCodes.current.add(code);
            
            fetchEvents(code);
            setGoogleAuthCode(code);
            
            // Clear the URL parameters after processing
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && processedAuthCodes.current.has(code)) {
            console.log('Skipping already processed auth code:', code);
            // Clear the URL parameters even if we skip processing
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (code && isFetchingEvents.current) {
            console.log('Skipping auth code - already fetching events:', code);
            // Clear the URL parameters even if we skip processing
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search]);

    // Check if user is already connected on page load
    useEffect(() => {
        const checkConnection = async () => {
            // Skip if we're currently processing a new auth code
            if (isProcessingNewAuthCode) {
                console.log('Skipping checkConnection - processing new auth code');
                return;
            }
            
            // Skip if we're currently fetching events
            if (isFetchingEvents.current) {
                console.log('Skipping checkConnection - already fetching events');
                return;
            }
            
            // Skip if we just completed a fresh connection
            if (justCompletedFreshConnection.current) {
                console.log('Skipping checkConnection - just completed fresh connection');
                return;
            }
            
            try {
                const connected = localStorage.getItem('googleCalendarConnected');
                const storedAuthCode = localStorage.getItem('googleAuthCode');
                const storedEvents = localStorage.getItem('googleCalendarEvents');
                
                console.log('Checking connection - connected:', connected, 'storedAuthCode:', storedAuthCode, 'isProcessingNewAuthCode:', isProcessingNewAuthCode, 'isFetchingEvents:', isFetchingEvents.current, 'justCompletedFreshConnection:', justCompletedFreshConnection.current);
                
                // Only restore connection status if we have connection data
                if (connected === 'true' && storedAuthCode && storedEvents) {
                    console.log('Restoring connection status from localStorage');
                    setIsGoogleConnected(true);
                    setGoogleAuthCode(storedAuthCode);
                    
                    // Load stored events without making API calls
                    try {
                        const parsedEvents = JSON.parse(storedEvents);
                        setEvents(parsedEvents);
                        console.log('Loaded stored events from localStorage');
                    } catch (e) {
                        console.log('Error parsing stored events:', e);
                        setEvents([]);
                    }
                } else {
                    // Clear any partial connection data
                    console.log('Clearing connection data - missing connection status or auth code');
                    setIsGoogleConnected(false);
                    setGoogleAuthCode(null);
                    localStorage.removeItem('googleCalendarConnected');
                    localStorage.removeItem('googleCalendarEvents');
                    localStorage.removeItem('googleAuthCode');
                }
            } catch (error) {
                console.log('Error checking connection status:', error);
                // If there's an error, clear the connection status
                setIsGoogleConnected(false);
                setGoogleAuthCode(null);
                localStorage.removeItem('googleCalendarConnected');
                localStorage.removeItem('googleCalendarEvents');
                localStorage.removeItem('googleAuthCode');
            }
        };
        checkConnection();
    }, [isProcessingNewAuthCode]);

    const fetchInsight = async () => {
        setAiLoading(true);
        setAiInsight("");
        try {
            const res = await axios.get('/api/task/insights');
            console.log('AI Insight Response:', res.data);
            setAiInsight(res.data.content && res.data.content.text ? res.data.content.text : JSON.stringify(res.data.content || res.data));
        } catch (error) {
            if (error.response && error.response.status === 403) {
                showMessage('You do not have permission to access this feature.', 'error');
            } else {
                showMessage('Error fetching AI insight', 'error');
                console.log(error);
            }
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
            if (
                error.response &&
                (error.response.status === 403 || error.response.status === 500) &&
                error.response.data &&
                typeof error.response.data === 'string' &&
                error.response.data.includes('Pro feature not available for premium users')
            ) {
                showMessage('This feature is not available for BASIC users.', 'error');
            } else if (
                error.response &&
                (error.response.status === 403 || error.response.status === 500) &&
                error.response.data &&
                typeof error.response.data === 'string' &&
                error.response.data.includes('Failed to fetch calendar events')
            ) {
                showMessage('Failed to fetch calendar events.', 'error');
            } else if (error.response && error.response.status === 403) {
                showMessage('You do not have permission to access this feature.', 'error');
            } else {
                showMessage('Error fetching event insights', 'error');
                console.log(error);
            }
        } finally {
            setEventInsightLoading(false);
        }
    }

    const loadTask = async () => {
        const res = await axios.get('/api/task/my-tasks');
        setTasks(res.data);
    };
    useEffect(() => {loadTask();}, []);

    // Fetch user info for greeting
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/user/you');
                setUser(res.data);
            } catch {
                setUser({ name: "", username: "" });
            }
        };
        fetchUser();
    }, []);

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }

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
                        <div key={idx} className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30">
                            <div className="text-gray-100 text-base leading-relaxed">{item.text}</div>
                        </div>
                    ))}
                </div>
            );
        }
        if (typeof parsed === 'object' && parsed.text) {
            return <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30 text-gray-100 text-base leading-relaxed mt-2 w-full">{parsed.text}</div>;
        }
        return <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30 text-gray-100 text-base leading-relaxed mt-2 w-full">{String(parsed)}</div>;
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Personalized Greeting */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-green-400 drop-shadow-lg">
                        {getGreeting()}{user.name ? `, ${user.name}` : "!"}
                    </h2>
                </div>
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        InsightPulse Dashboard
                    </h1>
                    <p className="text-gray-300 text-lg">Your productivity command center</p>
                </div>

                {/* Top Row - AI Insights & Event Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Insights Card */}
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-xl">💡</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">AI Insights</h2>
                        </div>
                        <button
                            onClick={() => fetchInsight(googleAuthCode)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={aiLoading}
                        >
                            {aiLoading ? 'Generating...' : 'Get AI Suggestion'}
                        </button>
                        {aiLoading && (
                            <div className="mt-4 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <div className="text-blue-400 font-medium text-center animate-pulse">Generating insight...</div>
                            </div>
                        )}
                        {aiInsight && (
                            <div className="mt-4">
                                {renderAiInsight()}
                            </div>
                        )}
                    </div>

                    {/* Event Insights Card */}
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="text-xl">📅</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">Event Insights</h2>
                        </div>
                        <button
                            onClick={() => fetchEventInsight(googleAuthCode)}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            disabled={eventInsightLoading}
                        >
                            {eventInsightLoading ? 'Generating...' : 'Get Event Insight'}
                        </button>
                        {eventInsightLoading && (
                            <div className="mt-4 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <div className="text-green-400 font-medium text-center animate-pulse">Generating event insight...</div>
                            </div>
                        )}
                        {eventInsight && (
                            <div className="mt-4 space-y-3">
                                {(() => {
                                    let parsed;
                                    try {
                                        parsed = typeof eventInsight === 'string' ? JSON.parse(eventInsight) : eventInsight;
                                    } catch {
                                        parsed = eventInsight;
                                    }
                                    if (Array.isArray(parsed)) {
                                        return parsed.map((item, idx) => (
                                            <div key={idx} className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30">
                                                <div className="text-gray-100 text-base leading-relaxed">{item.text}</div>
                                            </div>
                                        ));
                                    }
                                    if (typeof parsed === 'object' && parsed.text) {
                                        return (
                                            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30">
                                                <div className="text-gray-100 text-base leading-relaxed">{parsed.text}</div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30">
                                            <div className="text-gray-100 text-base leading-relaxed">{String(parsed)}</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className={`w-full text-center py-3 rounded-xl font-semibold shadow-lg ${
                        messageType === 'success' 
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/30' 
                            : 'bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-300 border border-red-500/30'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Google Calendar Connection */}
                {!isGoogleConnected && (
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32" height="32">
                                    <g>
                                        <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.6 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
                                        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 15.2 3 7.7 8.7 6.3 14.7z"/>
                                        <path fill="#FBBC05" d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.5 26.7 37.5 24 37.5c-6.1 0-10.7-4.1-12.5-9.6l-7 5.4C7.7 39.3 15.2 45 24 45z"/>
                                        <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.2 43.1 21 45 24 45c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
                                    </g>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Connect Google Calendar</h3>
                            <p className="text-gray-400 mb-6">Sync your calendar events for better insights</p>
                            <button
                                onClick={getAuthUrl}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Connect Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Tasks Section - Takes 2 columns on large screens */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Task List */}
                        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <span className="text-xl">📋</span>
                                </div>
                                <h2 className="text-xl font-bold text-white">Your Tasks</h2>
                            </div>
                            {tasks.length === 0 && !aiLoading && !eventsLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30 animate-pulse flex flex-col gap-3">
                                            <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
                                            <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                                            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                    <p className="text-gray-400 text-lg">No tasks yet. Create your first task!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tasks.map(t => (
                                        <div key={t.id} className="bg-gray-800/60 rounded-xl p-4 border border-gray-600/30 hover:border-yellow-500/50 transition-all duration-300 group" onClick={() => handleUpdate(t)}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-white group-hover:text-yellow-400 transition-colors">
                                                        {t.taskName}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm mt-1">{t.taskDescription}</p>
                                                    <div className="flex flex-wrap gap-3 mt-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            t.taskPriority === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                            t.taskPriority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                            'bg-green-500/20 text-green-300 border border-green-500/30'
                                                        }`}>
                                                            {t.taskPriority}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            t.taskStatus === 'CLOSED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                                            t.taskStatus === 'INPROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                                        }`}>
                                                            {t.taskStatus}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            📅 {t.taskDueDate}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleUpdate(t)} 
                                                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-lg transition-all duration-300 border border-yellow-500/30 hover:border-yellow-500/50"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(t)} 
                                                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Google Calendar Events */}
                        {isGoogleConnected && (
                            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                                                <g>
                                                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.6 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
                                                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 15.2 3 7.7 8.7 6.3 14.7z"/>
                                                    <path fill="#FBBC05" d="M24 45c5.1 0 9.8-1.7 13.4-4.7l-6.2-5.1C29.2 36.5 26.7 37.5 24 37.5c-6.1 0-10.7-4.1-12.5-9.6l-7 5.4C7.7 39.3 15.2 45 24 45z"/>
                                                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C18.2 43.1 21 45 24 45c10.5 0 20-7.7 20-21 0-1.3-.1-2.7-.3-4z"/>
                                                </g>
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Google Calendar Events</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                                            ✓ Connected
                                        </span>
                                        <button
                                            onClick={() => {
                                                clearGoogleCalendarData();
                                                showMessage('Google Calendar disconnected', 'success');
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300 underline hover:no-underline transition-all"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                                
                                {eventsLoading ? (
                                    <div className="grid gap-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-blue-500 animate-pulse flex gap-4">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-5 bg-gray-700 rounded w-1/2"></div>
                                                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : events.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📅</span>
                                        </div>
                                        <p className="text-gray-400">No upcoming events found in your Google Calendar.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {Array.isArray(events) ? events.map((event, index) => (
                                            <div key={index} className="bg-gray-800/60 rounded-xl p-4 border-l-4 border-blue-500 hover:border-blue-400 transition-all duration-300 group">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <span className="text-blue-400">📅</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-blue-400 transition-colors">
                                                            {event.split(' - ')[1] || 'Untitled Event'}
                                                        </h3>
                                                        <p className="text-gray-300 text-sm">
                                                            {formatDate(event.split(' - ')[0])}
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

                    {/* Task Form - Takes 1 column on large screens */}
                    <div className="xl:col-span-1">
                        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl sticky top-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isUpdate 
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                                }`}>
                                    <span className="text-xl">{isUpdate ? '✏️' : '➕'}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {isUpdate ? 'Update Task' : 'Create Task'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Task Name</label>
                                    <input
                                        name="taskName"
                                        value={form.taskName}
                                        onChange={handleChange}
                                        placeholder="Enter task name"
                                        className="w-full border border-gray-600 bg-gray-800/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <input
                                        name="taskDescription"
                                        value={form.taskDescription}
                                        onChange={handleChange}
                                        placeholder="Enter task description"
                                        className="w-full border border-gray-600 bg-gray-800/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                        <select
                                            name="taskStatus"
                                            value={form.taskStatus}
                                            onChange={handleChange}
                                            className="w-full border border-gray-600 bg-gray-800/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="INPROGRESS">In Progress</option>
                                            <option value="OPEN">Open</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                        <select
                                            name="taskPriority"
                                            value={form.taskPriority}
                                            onChange={handleChange}
                                            className="w-full border border-gray-600 bg-gray-800/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            required
                                        >
                                            <option value="">Select Priority</option>
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                                    <input
                                        name="taskDueDate"
                                        value={form.taskDueDate}
                                        onChange={handleChange}
                                        type="date"
                                        className="w-full border border-gray-600 bg-gray-800/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                                            isUpdate 
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white' 
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                        }`}
                                    >
                                        {isUpdate ? 'Update Task' : 'Create Task'}
                                    </button>
                                    {isUpdate && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-3 bg-gray-700/60 hover:bg-gray-700/80 text-gray-200 font-semibold rounded-xl transition-all duration-300 border border-gray-600/30 hover:border-gray-600/50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}