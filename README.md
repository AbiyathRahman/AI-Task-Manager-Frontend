# InsightPulse Frontend

This is the frontend for **InsightPulse**, a full-stack productivity and task management app.  
It interacts with a Spring Boot backend via RESTful APIs and is deployed on **Vercel**.

![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat-square)
[![Live Demo](https://img.shields.io/badge/🌐%20Live-Demo-blue?style=for-the-badge)](https://your-frontend-url.vercel.app)

---

## 🛠️ Tech Stack

- **React.js** (or Next.js, Vite, etc.)
- **Tailwind CSS** or Bootstrap (optional)
- **Axios** for API calls
- **Vercel** for hosting

---

## 🔗 Backend API

The frontend communicates with a Spring Boot backend hosted on Render:

https://insightpulse-dye1.onrender.com

---

## 📦 Getting Started Locally

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/insightpulse-frontend.git
cd insightpulse-frontend

REACT_APP_API_URL=https://your-backend.onrender.com
3. Run the App
bash
npm install
npm run dev
App will run on http://localhost:3000
🧪 Features
User Registration & Login

Token-based authentication

Task management

Protected routes

📂 Project Structure
css
Copy
Edit
src/
  ├── components/
  ├── pages/
  ├── services/
  └── App.jsx
