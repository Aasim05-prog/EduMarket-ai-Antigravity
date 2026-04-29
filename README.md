# 📚 EduMarket — AI-Powered Study Notes Marketplace

A full-stack platform where students can upload, share, discover, and purchase study notes across all education levels — from Std 1 to Master's degree and competitive exams.

## ✨ Features

- **Browse & Search**: Discover notes by subject, standard, and category
- **AI-Powered Upload**: Upload handwritten/typed notes with AI digitalization
- **Real-Time Chat**: Negotiate prices directly with note sellers via Socket.io
- **Razorpay Payments**: Secure payment gateway for premium notes
- **User Profiles**: Dashboard with upload stats, ratings, and purchased notes
- **Notifications**: Real-time notifications for purchases, messages, and reviews

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Payments | Razorpay |
| Auth | JWT + bcrypt |
| File Upload | Multer |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/Aasim05-prog/EduMarket-ai-Antigravity.git
cd EduMarket-ai-Antigravity
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env     # then edit .env with your values
npm run dev               # starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ..                     # back to project root
npm install
cp .env.example .env      # then edit .env with your values
npm run dev               # starts on http://localhost:5173
```

### 4. Seed Database (optional)
```bash
cd backend
node seedTextbooks.js     # populates sample NCERT textbooks
```

## 📁 Project Structure
```
edumarket/
├── src/                  # React frontend (Vite)
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth context & API service
│   ├── pages/            # Route pages
│   └── main.jsx          # App entry point
├── backend/              # Node.js Express server
│   ├── config/           # Database connection
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth & file upload
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── sockets/          # Socket.io chat
│   └── server.js         # Entry point
└── package.json
```

## 👤 Author
**Aasim** — [@Aasim05-prog](https://github.com/Aasim05-prog)
