ResumeBuilder Application

This project is a full-stack Resume Builder application with a separate frontend and backend setup.

Project Structure
ResumeBuilder/
│
├── frontend/   # Frontend application (UI)
└── backend/    # Backend application (API + Database)

Frontend Setup
Navigate to frontend folder
cd frontend

Install dependencies
npm install

Run frontend
npm run dev


Frontend will run on:

http://localhost:5173


(or the port shown in terminal)

Frontend .env File

Create a .env file inside the frontend folder:

VITE_BACKEND_URL=http://localhost:5051


Replace 5051 if your backend runs on a different port.

Backend Setup
Navigate to backend folder
cd backend

Install dependencies
npm install

Run backend
npm run dev


Backend will run on:

http://localhost:5051

Backend .env File

Create a .env file inside the backend folder:

PORT=5051
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resumebuilder
FRONTEND_URL=http://localhost:5173


🔹 Replace:

<username> → MongoDB Atlas username

<password> → MongoDB Atlas password

resumebuilder → your database name if different


🔄 Environment Flow

Frontend calls Backend using VITE_BACKEND_URL

Backend allows requests from FRONTEND_URL

Backend connects to MongoDB using MONGO_URI


Important Notes

 Do NOT push .env files to GitHub / Bitbucket

 Use .gitignore to ignore:

node_modules/
.env
dist/

Tech Stack

Frontend: React + Vite

Backend: Node.js + Express

Database: MongoDB Atlas

Version Control: Git + Bitbucket

Running the Project (Quick Start)
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev