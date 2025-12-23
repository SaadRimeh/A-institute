# ![Node.js](https://img.shields.io/badge/Node.js-16+-green) School Management Backend API ![License](https://img.shields.io/badge/License-MIT-blue)

**Professional REST API for managing students, teachers, courses, appointments, attendance, and finance.**

---

## Table of Contents

- [Project](#project)  
- [Overview](#overview)  
- [Prerequisites](#prerequisites)  
- [Environment Setup](#environment-setup)  
- [Installation](#installation)  
- [Running the API](#running-the-api)  
- [Health Check](#health-check)  
- [Authentication](#authentication)  
- [Example Endpoints](#example-endpoints)  
- [API Testing with Postman](#api-testing-with-postman)  
- [Development Notes](#development-notes)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Project

The **School Management Backend** is a scalable system to manage all administrative and academic operations of a school or training center. It supports **three user roles**:

- **Secretary:** Full administrative control; manages students, courses, appointments, and finances.  
- **Teacher:** Access to assigned appointments, student lists, attendance, notes, and financial reports.  
- **Student:** Access to personal courses, appointments, and financial information only.  

**Key Features:**

- JWT-based authentication and secure authorization  
- Role-based access control (RBAC)  
- Student and teacher management  
- Course creation and enrollment  
- Appointment scheduling  
- Attendance tracking per session  
- Financial management (payments, balances, teacher earnings)  
- ES Modules (`import/export`) architecture with MVC pattern  
- Clean, production-ready, and extensible  

---

## Overview

- **Tech Stack:** Node.js + Express + MongoDB (Mongoose)  
- **Folder Structure:**  

backend/
├── server.js
├── src/
│ ├── app.js
│ ├── routes/
│ ├── controllers/
│ └── models/
├── middleware/
├── .env
├── ENDPOINTS.md
├── ENDPOINTS_DETAILED.md
└── postman_collection.json

yaml
Copy code

---

## Prerequisites

- Node.js v16+  
- npm (or pnpm/yarn)  
- MongoDB (local or remote instance)  

---

## Environment Setup

Create a `.env` file in the project root:

MONGODB_URI=mongodb://localhost:27017/school_db
PORT=5000
JWT_SECRET=supersecretkey

yaml
Copy code

---

## Installation

cd backend
npm install

yaml
Copy code

---

## Running the API

**Development mode (with nodemon):**

npm run dev

markdown
Copy code

**Production mode:**

npm start

yaml
Copy code

---

## Health Check

GET /health

makefile
Copy code

**Response:**

{
"status": "ok"
}

yaml
Copy code

---

## Authentication

**Login**

POST /api/v1/auth/login

makefile
Copy code

**Payload:**

{
"loginCode": "12345"
}

makefile
Copy code

**Response:**

{
"token": "<JWT_TOKEN>",
"role": "STUDENT",
"profile": {
"name": "John Doe",
"courses": ["Math 101", "Physics 102"]
}
}

pgsql
Copy code

**Authorization Header for Protected Routes:**

Authorization: Bearer <JWT_TOKEN>

markdown
Copy code

---

## Example Endpoints

### Secretary

- **Create Student:** `POST /api/v1/secretary/students`  
- **Get All Students:** `GET /api/v1/secretary/students`  
- **Create Course:** `POST /api/v1/secretary/courses`  
- **Schedule Appointment:** `POST /api/v1/secretary/appointments`  
- **Record Payment:** `POST /api/v1/secretary/finance/:studentId/payments`  

### Teacher

- **View Appointments:** `GET /api/v1/teacher/appointments`  
- **Mark Attendance:** `POST /api/v1/teacher/attendance`  
- **Write Session Notes:** `POST /api/v1/teacher/notes`  

### Student

- **View Courses:** `GET /api/v1/student/courses`  
- **View Appointments:** `GET /api/v1/student/appointments`  
- **View Finance:** `GET /api/v1/student/finance`  

---

## API Testing with Postman

- Import `postman_collection.json` for pre-configured requests.  
- Collection variables:  
  - `{{baseUrl}}` → `http://localhost:5000/api/v1`  
  - `{{token}}` → JWT token from login  
- Suggested workflow:  
  1. Create users (secretary, teacher, student)  
  2. Log in and copy token  
  3. Test courses, appointments, attendance, and finance endpoints  

---

## Development Notes

- Passwords are hashed in `src/models/User.js` using `bcryptjs`  
- Role-based access enforced via `auth.middleware.js` and `role.middleware.js`  
- `Finance.balance` is computed as a virtual field: `totalDue - paid`  

---

## Contributing

- Fork the repository  
- Create a feature branch: `git checkout -b feature/xyz`  
- Commit changes: `git commit -m "Add feature"`  
- Open a pull request with a clear description  

---

## License

- MIT (or your preferred license)  

---

## Contact

- For support or questions, email: **saad.rimeh.01@gmail.com**
