# BatchNotes: Student Peer Feedback Management System

A MERN-stack app where students register, log in, and leave feedback ("notes") for any other student. Each student sees the notes they received and the ones they wrote. An admin views, edits, and deletes all feedback and manages students.

## Features

**Students**
- Register (name, email, roll no, department, year, phone, password) with validation
- Log in with JWT authentication
- Browse all batchmates, with search by name or roll no and filters by department/year
- New registrations appear in the list immediately
- Open a student's profile to see their average rating and ratings by area
- Give feedback: category, 1–5 star rating, comment, and an optional anonymous toggle
- Can't give feedback to yourself (blocked in both frontend and backend)
- "Notes for me": all feedback received (anonymous senders are hidden)
- "Notes I wrote": all feedback given

**Admin**
- Stats: total students, total feedback, average rating, top 3 rated students, category breakdown
- View all feedback, including the real sender of anonymous notes
- Search and filter feedback by student, category, and rating
- Edit or delete any feedback
- View all students, and delete a student (also deletes their feedback)

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios, Tailwind CSS v4, react-hot-toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Folder structure

```
batchnotes/
├── server/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # User, Feedback schemas
│   ├── controllers/            # auth, student, feedback, admin logic
│   ├── routes/                 # API routes
│   ├── middleware/auth.js      # protect, adminOnly, studentOnly
│   ├── utils/helpers.js        # asyncHandler, generateToken
│   ├── seed.js                 # pre-loaded data
│   └── server.js               # entry point
└── client/
    └── src/
        ├── api/axios.js        # API client with JWT
        ├── context/AuthContext.jsx
        ├── components/         # Navbar, FeedbackNote, StarRating, Modal, ...
        └── pages/              # Login, Register, Students, StudentProfile,
                                # Received, Given, AdminDashboard
```

## Database (MongoDB collections)

**users**: name, email, rollNo, department, year, phone, password (hashed), role (`student` | `admin`)

**feedbacks**: givenTo (→ user), givenBy (→ user), category, rating (1–5), comment, isAnonymous, createdAt

Categories: Technical Skills, Communication, Teamwork, Behaviour, Leadership, Punctuality

## Run locally

### 1. Create a free MongoDB Atlas database
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access**: add a database user with a username and password.
3. **Network Access**: add IP `0.0.0.0/0` (allow from anywhere; needed for Render).
4. Click **Connect → Drivers** and copy the connection string. Put the database name `batchnotes` before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/batchnotes?retryWrites=true&w=majority`

### 2. Backend
```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```
Fill in `.env`:
```
PORT=5000
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<any long random string>
CLIENT_URL=http://localhost:5173
```
Then:
```bash
npm run seed    # loads the starting data
npm run dev     # starts API on http://localhost:5000
```

### 3. Frontend (new terminal)
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # opens on http://localhost:5173
```

## Default logins (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | admin123 |
| Student | aarav.sharma@student.college.edu | student123 |

All 10 seeded students use `student123`. Their emails follow `firstname.lastname@student.college.edu` (Vikram's is `vikram.rathore@...`). The login page also has "fill demo login" buttons.

**Seeded data:** 1 admin, 10 students (CSE, IT, ECE, CSE-AI/ML across 2nd–4th year), and 25 feedback entries with a mix of ratings, categories, and anonymous notes.

## API reference

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | Public | Student sign up |
| POST | /api/auth/login | Public | Log in, returns JWT |
| GET | /api/auth/me | Logged in | Current user |
| GET | /api/students | Student | List students (`?search=&department=&year=`) |
| GET | /api/students/:id | Student | Profile + rating summary |
| POST | /api/feedback | Student | Give feedback |
| GET | /api/feedback/received | Student | Feedback received |
| GET | /api/feedback/given | Student | Feedback given |
| GET | /api/admin/stats | Admin | Dashboard numbers |
| GET | /api/admin/feedback | Admin | All feedback (`?search=&category=&rating=`) |
| PUT | /api/admin/feedback/:id | Admin | Edit feedback |
| DELETE | /api/admin/feedback/:id | Admin | Delete feedback |
| GET | /api/admin/students | Admin | All students |
| DELETE | /api/admin/students/:id | Admin | Delete student + their feedback |

## Deployment

Order: **Atlas → Render (backend) → Vercel (frontend) → update CORS on Render.**

### Step 1: Push to GitHub
Push the whole `batchnotes` folder to a GitHub repo. `.env` files are git-ignored, so your secrets stay private.

### Step 2: Backend on Render
1. https://render.com → **New → Web Service** → connect your repo.
2. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance type: Free
3. **Environment variables:** `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (use `http://localhost:5173` for now).
4. Deploy, then open `https://<your-app>.onrender.com/api/health`. It should show `{"status":"ok"}`.
5. The starting data loads automatically: when the server starts on an empty database, it inserts the seed data by itself (check the Render logs for "Loaded 10 students"). To reset the data later, run `npm run seed` locally with the same `MONGO_URI`.

> Render's free tier sleeps after 15 min idle, so the first request after that takes about 30–50 seconds. Open the health URL a minute before your demo.

### Step 3: Frontend on Vercel
1. https://vercel.com → **Add New → Project** → import the same repo.
2. Root Directory: `client` (Vercel detects Vite automatically).
3. Environment variable: `VITE_API_URL = https://<your-app>.onrender.com/api`
4. Deploy. `vercel.json` makes page refreshes on routes like `/students` work.

### Step 4: Fix CORS
Back on Render, set `CLIENT_URL` to your Vercel URL, e.g. `https://batchnotes.vercel.app` (no trailing slash). To allow both local and live, use commas: `https://batchnotes.vercel.app,http://localhost:5173`. Render redeploys automatically.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Failed to connect to MongoDB` | Check `MONGO_URI`, the DB user's password, and that Network Access allows `0.0.0.0/0` |
| "Cannot reach the server" on frontend | Backend not running, or `VITE_API_URL` is wrong. Redeploy Vercel after changing env vars |
| CORS error in browser console | `CLIENT_URL` on Render must exactly match the Vercel URL |
| 404 on page refresh (Vercel) | Make sure `client/vercel.json` was deployed |
| Password with `@` or `#` breaks the URI | URL-encode it (`@` → `%40`) or pick a password without symbols |
