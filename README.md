# 🕌 SiratAI: AI-Powered Islamic Learning Platform

SiratAI is a modern, interactive, and gamified web application designed to help users learn the fundamentals of Islam—covering Creed (Aqeeda), Worship (Fiqh), Etiquette (Thareeq), and Scripture (Quran). 

It features real-time AI-powered posture verification for physical acts of worship (Salah and Wudu) using computer vision, voice guidelines for recitation, and a comprehensive student-to-scholar communication portal.

---

## ✨ Key Features

### 1. 🗺️ Structured Learning Paths
Embark on curated paths tailored for new Muslims and seekers of knowledge:
*   **Thareeq (Islamic Manners):** Daily Duas, Adhkar, Salah & Wudu training, and character building.
*   **Fiqh (Jurisprudence):** Purification (Tahara), Salah rules, Fasting, Zakah, and Hajj.
*   **Quran:** Tajweed basics, pronunciation, reading guidelines, and memorization aids.
*   **Aqeeda (Creed):** Tawheed, Names of Allah, belief in Angels, Prophets, Books, and the Hereafter.

Each lesson is divided into a structured 4-step workflow:
1.  **Learn:** Comprehensive text guides with Arabic scripts and translations.
2.  **Observe:** Animated step-by-step illustrations.
3.  **Practice:** Interactive matching, ordering, and voice exercises.
4.  **Evaluate:** Custom-tailored fill-in-the-blank and multiple-choice quizzes.

---

### 2. 🤖 AI-Powered Webcam Verification
*   **Salah & Wudu Posture Check:** Real-time pose estimation using **MediaPipe Pose** and **TensorFlow.js**. The application processes webcam inputs to mathematically verify positions (such as Qiyam, Ruku, Sujood, and Jalsa) and provides instant alignment feedback.
*   **Recitation Assistant:** Practice pronouncing short Surahs with visual playback and audio guidelines.

---

### 3. 🏆 Gamification & Engagement
*   **Streaks & Levels:** Stay consistent with daily login streaks.
*   **Rewards:** Earn **XP** and **Coins** by completing lessons and scoring well on evaluations.
*   **Leaderboard:** Friendly weekly and all-time student ranking systems.
*   **Achievements:** Unlock badges like *First Steps*, *Scholar*, and *Flame Starter*.

---

### 4. 💬 Student-to-Scholar Portal (Mufti Dashboard)
*   **Direct Chat:** Ask verified Muftis or scholars complex queries directly.
*   **Interactive Calls:** Support for audio/video calling and screen sharing inside the chat workspace.
*   **Grading System:** Scholars can review recitation recordings and assign feedback.

---

### 5. 👥 Community Forums
*   Engage with other students in moderated discussion threads grouped by topic.
*   Scholars/Muftis can verify and pin correct answers to common questions.

---

## 🛠️ Technology Stack

### Frontend
*   **Core:** React.js, Vite
*   **Styling:** CSS3, TailwindCSS (for responsive layouts)
*   **State & Animations:** Framer Motion, React Icons
*   **Libraries:** Axios, React Router, Chart.js (for progress tracking)
*   **AI Integration:** TensorFlow.js, `@mediapipe/pose`, React Webcam

### Backend & Database
*   **Runtime:** Node.js, Express
*   **Database:** MongoDB, Mongoose
*   **Security:** JWT (JSON Web Tokens), Bcrypt.js (Password Hashing)
*   **File Uploads:** Multer, Cloudinary integration

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   MongoDB local instance or MongoDB Atlas URI

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/sirathai-ai.git
    cd sirathai-ai
    ```

2.  **Install Dependencies:**
    *   **Root & Frontend:**
        ```bash
        npm install
        ```
    *   **Backend Server:**
        ```bash
        cd server
        npm install
        cd ..
        ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/siratai
    JWT_SECRET=your_jwt_secret_key
    CLIENT_URL=http://localhost:5173
    ```

4.  **Seed the Database:**
    Populate the learning paths, 38 lessons, test students, muftis, achievements, and initial forum posts:
    ```bash
    npm run seed
    ```

5.  **Run Locally in Development Mode:**
    Start both the frontend client and backend API server simultaneously:
    *   **Start Backend:**
        ```bash
        cd server
        npm run dev
        ```
    *   **Start Frontend (In a separate terminal):**
        ```bash
        npm run dev
        ```

6.  **Open the App:**
    Navigate to `http://localhost:5173` in your browser.
    *   **Test Student Account:** `test@siratai.com` / `test123`
    *   **Test Mufti Account:** `mufti@siratai.com` / `mufti123`
    *   **Test Admin Account:** `admin@siratai.com` / `admin123`

---

## 📂 Project Structure

```
├── public/                 # Static assets
├── src/                    # Frontend React code
│   ├── assets/             # Images and styles
│   ├── components/         # Reusable UI elements (Leaderboards, Navbars)
│   ├── context/            # Auth and App Context
│   ├── data/               # Static mock databases
│   ├── pages/              # Main routes (Dashboard, LessonPlayer, Inbox, Forum)
│   ├── services/           # Axios API request mapping
│   └── utils/              # Helper utilities
├── server/                 # Backend Node.js code
│   ├── config/             # DB connections
│   ├── middleware/         # Auth & role checking middleware
│   ├── models/             # Mongoose Schemas (User, Lesson, Path, Progress)
│   ├── routes/             # API Router endpoints
│   ├── seed/               # Database Seeding script
│   └── server.js           # Server entry point
├── package.json
└── tailwind.config.js
```

---

## 📄 License
This project is licensed under the MIT License.
