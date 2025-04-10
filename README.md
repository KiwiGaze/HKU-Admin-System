# Student Dissertation Management System Prototype
Author: [Qi Yijiazhen](http://www.qiyijiazhen.com) 
## Project Overview

This project is a prototype for a Student Dissertation Management System developed as part of a take-home assessment. The system allows Administrators (Admin) and Teachers to manage the progress of student dissertations, including student assignments, grading, and status tracking.

## Project Structure
```
HKU-Admin-System/
├── README.md
├── client/
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── App.vue
│   │   ├── assets/
│   │   │   └── vue.svg
│   │   ├── components/
│   │   │   ├── common/        # Common components (e.g., ConfirmationModal)
│   │   │   ├── students/      # Student-related components
│   │   │   ├── ui/            # UI components (e.g., Button, Card)
│   │   │       ├── alert/         # Alert components
│   │   │       ├── button/        # Button components
│   │   ├── main.ts
│   │   ├── router/            # Vue Router configuration
│   │   │   ├── index.ts       # Router setup
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # API calls to the backend
│   │   ├── stores/            # Pinia state management
│   │   │   ├── authStore.ts    # Authentication store
│   │   │   ├── studentStore.ts # Student-related store
│   │   │   └── teacherStore.ts  # Teacher-related store
│   │   ├── style.css
│   │   ├── types/             # TypeScript type definitions
│   │   │   ├── models.ts      # Type definitions for models (Student, Teacher)
│   │   ├── views/             # Page-level components
│   │   │   ├── AdminDashboard.vue
│   │   │   ├── LoginPage.vue
│   │   │   └── TeacherDashboard.vue
│   │   └── vite-env.d.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── server/
    ├── package-lock.json
    ├── package.json
    ├── src/
    │   ├── index.ts                 # Main entry point, server setup and database initialization
    │   ├── models/
    │   │   └── index.ts             # Database model definitions (Student, Teacher)
    │   └── routes/                  # API routes
    │       ├── authRoutes.ts        # Authentication routes (/login)
    │       ├── studentRoutes.ts     # Student-related routes (/api/students/*)
    │       └── teacherRoutes.ts     # Teacher-related routes (/api/teachers)
    └── tsconfig.json
```

## Features

### Administrator (Admin)

* **Manage Student Lists:** Add new students to the system.
* **Assign Students to Teachers:** Allocate students to specific teachers (not allowed for finalized records).
* **View All Student Status:** Display a comprehensive overview of all students, including their assigned teacher, progress and final report grades, and finalization status.

### Teacher

* **View Assigned Students:** Access a list containing only the students assigned to them.
* **Input Student Grades:** Enter grades for both progress and final reports (not allowed for finalized records).
* **Finalize Records:** Mark a student's record as finalized after grading (requires final grade to be entered), preventing further modifications after confirmation.

## Technology Stack

* **Frontend:** Vue.js 3 with TypeScript
* **UI Framework:** Tailwind CSS
* **UI Components Library:** [Shadcn/Vue](https://www.shadcn-vue.com/)
* **Development Server:** Vite
* **State Management:** Pinia
* **Backend:** Express.js (Node.js)
* **Database:** SQLite
* **Data Persistence:** SQLite with Sequelize ORM
* **API Testing:** curl or Postman
* **Icon Library:** [Lucide-Vue-Next](https://lucide.dev/)

## Getting Started

### Prerequisites

* Node.js and npm (or yarn) installed.
* Git (for cloning the repository).

### Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/KiwiGaze/HKU-Admin-System.git
  cd HKU-Admin-System
  ```
2. Install frontend dependencies:
  ```bash
  cd client
  npm install
  ```
3. Install backend dependencies:
  ```bash
  cd ../server
  npm install
  ```

### Running the Application

1. **Run the Backend Server:**
  ```bash
  # In the server directory
  npm run dev
  ```
  The backend API will run on `http://localhost:3000`. On first run, it will:
  - Create a SQLite database file (`database.sqlite`)
  - Initialize default teacher data automatically

2. **Run the Frontend (Vite Development Server):**
  ```bash
  # In the client directory
  npm run dev
  ```
  The application should be accessible at `http://localhost:5173`.

## Usage

### Authentication (Login Credentials)

* **Admin Login:**
  - Username: `admin`
  - Password: `admin123`

* **Teacher Logins:**
  - Username: `teacher1`, Password: `pass123` (Professor Smith)
  - Username: `teacher2`, Password: `pass456` (Dr. Johnson)

### API Endpoints

The backend provides the following RESTful API endpoints:

* **Authentication:**
  - `POST /login` - Validate user credentials, return role and user ID

* **Admin Endpoints:**
  - `GET /api/teachers` - Get all teachers (Admin only)
  - `GET /api/students` - Get all students (Admin sees all, Teacher sees assigned only)
  - `POST /api/students` - Create a new student (Admin only)
  - `PUT /api/students/:id/assign` - Assign a teacher to a student (Admin only)
  - `PUT /api/students/:id/unassign` - Unassign a teacher from a student (Admin only)
  - `PUT /api/students/:id/unfinalize` - Unfinalize a student record (Admin only)
  - `DELETE /api/students/:id` - Delete a student record (Admin only)

* **Teacher Endpoints:**
  - `PUT /api/students/:id/grade` - Grade a student's progress or final report (Teacher only)
  - `PUT /api/students/:id/finalize` - Finalize a student's record (Teacher only, requires final grade)

For API testing, you can use curl commands as described in the development documentation.

## Video Demonstration

A video demonstration showcasing the application's features and workflow can be found here:
[Link to Video Demonstration - To be added]

## Future Improvements

* Implement a proper frontend interface with Vue.js components
* Add more robust error handling and user feedback
* Add more comprehensive logging
* Implement proper authentication with JWT instead of hardcoded credentials
* Add unit tests for both frontend and backend
* Improve API documentation with Swagger or similar tools
