# Student Dissertation Management System Prototype

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
│   │   │   └── HelloWorld.vue
│   │   ├── main.ts
│   │   ├── style.css
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
  │   └── index.ts
  └── tsconfig.json
```

## Features

### Administrator (Admin)

*   **Manage Student Lists:** Add new students to the system. (Optional: Edit and delete student information).
*   **Assign Students to Teachers:** Allocate students from the list to specific responsible teachers.
*   **View All Student Status:** Display a comprehensive overview of all students, including their assigned teacher, current grade, and finalization status.

### Teacher

*   **View Assigned Students:** Access a list containing only the students assigned to them.
*   **Input Student Grades:** Enter grades for the students under their supervision.
*   **Submit Grades:** Confirm and submit the entered grades.
*   **Finalize Records:** Mark a student's record as finalized after grading, making the status visible to the Admin.

## Technology Stack

*   **Frontend:** Vue.js (Mandatory)
*   **UI Framework:** Tailwind CSS (Mandatory)
*   **Development Server:** Vite (Mandatory)
*   **State Management:** Pinia 
*   **Backend:** Node.js with Express.js (Optional - Nice to Have)
*   **Data Persistence:**  PostgreSQL (Optional - Nice to Have)

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed.
*   Git (for cloning the repository).

### Installation

1.  Clone the repository:
  ```bash
  git clone https://github.com/KiwiGaze/HKU-Admin-System.git
  cd HKU-Admin-System
  ```
2.  Install frontend dependencies:
  ```bash
  cd client
  npm install
  ```
3.  Install backend dependencies:
  ```bash
  cd server
  npm install
  ```

### Running the Application

1.  **Run the Frontend (Vite Development Server):**
  ```bash
  # In the frontend directory
  npm run dev
  ```
  The application should be accessible at `http://localhost:5173`.

2.  **Run the Backend Server:**
  ```bash
  # In the backend directory
  npm run dev
  ```
  The backend API will likely run on a different port (e.g., `http://localhost:3000`).

## Usage

1.  Open the application in your web browser (link provided by the development server).
2.  The application may provide a simple mechanism (e.g., buttons, dropdown) to switch between the `Admin` and `Teacher` roles to demonstrate different functionalities.
3.  Follow the on-screen interface to perform actions relevant to the selected role:
  *   **Admin:** Add students, assign teachers, view the overall student status dashboard.
  *   **Teacher:** View assigned students, input grades, submit, and finalize records.


## Video Demonstration

A video demonstration showcasing the application's features and workflow can be found here:
[Link to Video Demonstration - To be added]

## Future Improvements
*   Implement user authentication and authorization for secure access.
*   Enhance the UI/UX for better user experience.
*   Add more detailed error handling and validation.
*   Implement a more robust backend with data persistence using PostgreSQL.
*   Add unit tests and integration tests for both frontend and backend.
*   Improve the state management and data flow between components.
*   Implement a more comprehensive logging system for tracking user actions and errors.
