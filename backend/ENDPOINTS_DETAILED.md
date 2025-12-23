**Detailed API Endpoints (request body & example responses)**

Base URL: `http://localhost:5000/api/v1`

Auth
- POST `/auth/login`
  - Auth: no
  - Body (JSON): { "loginCode": "<loginCode or phone>", "password": "<password if set>" }
  - Success (200):
    {
      "token": "<jwt>",
      "role": "STUDENT|TEACHER|SECRETARY",
      "profile": null | { /* Student or Teacher profile document (populated), no password */ }
    }
  - Errors: 400 missing loginCode, 404 user not found, 401 invalid credentials

Secretary (require `Authorization: Bearer <token>` and SECRETARY role)
Prefix: `/secretary`

- POST `/students`
  - Body: { "fullName": "John Doe", "phone": "+123...", "age": 17, "parentPhone": "+198...", "courses": ["<courseId>"], "password": "secret" }
  - Success (201):
    {
      "student": {
        "_id": "<studentId>", "user": "<userId>", "fullName": "John Doe", "phone": "+123...",
        "age": 17, "parentPhone": "+198...", "courses": ["<courseId>"], "createdAt": "..."
      },
      "loginCode": "<generatedLoginCode>"
    }

- GET `/students`
  - Body: none
  - Success (200): [ { student document (populated `courses`, `user` without password) }, ... ]

- GET `/students/:studentId`
  - Success (200): { student document populated }
  - 404 if not found

- PUT `/students/:studentId`
  - Body: any of { fullName, phone, age, parentPhone, courses } (partial updates allowed)
  - Success (200): updated student document

- DELETE `/students/:studentId`
  - Success (200): { "message": "Student deleted" }

Courses

- POST `/courses`
  - Body: { "name": "Math 101", "description": "...", "teacherId": "<teacherId>", "price": 100 }
  - Success (201): course document

- GET `/courses`
  - Success (200): [ course objects populated with `teacher` and `students` ]

- GET `/courses/:courseId`
  - Success (200): single course populated

- PUT `/courses/:courseId`
  - Body: any of { name, description, teacherId, price }
  - Success (200): updated course

- DELETE `/courses/:courseId`
  - Success (200): { "message": "Course deleted" }

- POST `/courses/:courseId/register-student`
  - Body: { "studentId": "<studentId>" }
  - Success (200): { "message": "Student registered to course" }

Appointments

- POST `/appointments`
  - Body: { "courseId": "<courseId>", "teacherId": "<teacherId> (optional)", "date": "ISO date string", "durationMinutes": 60, "notes": "...", "students": ["<studentId>"] }
  - Success (201): appointment document
  - 400 if course not found or teacher mismatch

- GET `/appointments`
  - Success (200): [ appointments (populated `course`, `teacher`, `students`) ]

- GET `/appointments/:appointmentId`
  - Success (200): appointment object
  - 404 if not found

- PUT `/appointments/:appointmentId`
  - Body: any of { date, durationMinutes, notes, students }
  - Success (200): updated appointment

- DELETE `/appointments/:appointmentId`
  - Success (200): { "message": "Appointment deleted" }

Finance (Secretary)

- POST `/finance/:studentId`
  - Body: { "totalDue": 200, "notes": "Semester fees" }
  - Success (200): finance document for the student (created or updated)

- POST `/finance/:studentId/payments`
  - Body: { "amount": 100, "method": "cash|card|transfer" }
  - Success (200): finance document with `payments` array updated, `paid` incremented
  - 404 if finance record not found

- GET `/finance/:studentId`
  - Success (200): finance document plus `balance` value included (computed)
  - 404 if not found

- GET `/finance/teacher/:teacherId`
  - Success (200): { "teacherId": "<teacherId>", "paid": <sum>, "outstanding": <sum> }

Teacher (require `TEACHER` role)
Prefix: `/teacher`

- GET `/teacher/appointments`
  - Success (200): appointments belonging to the authenticated teacher (populated)

- GET `/teacher/courses/:courseId/students`
  - Success (200): [ student documents ]
  - 403 if course not owned by teacher

- POST `/teacher/attendance`
  - Body: { "appointmentId": "<appointmentId>", "records": [ { "studentId": "<studentId>", "present": true, "note": "..." } ] }
  - Success (201): [ attendance documents (created/updated) ]
  - 403 if teacher not allowed to record for appointment

- GET `/teacher/attendance`
  - Success (200): [ attendance documents populated with `appointment` and `student` ]

- GET `/teacher/finance`
  - Success (200): { "paid": <number>, "outstanding": <number> }

Student (require `STUDENT` role)
Prefix: `/student`

- GET `/student/courses`
  - Success (200): [ courses the student is enrolled in ]

- GET `/student/appointments`
  - Success (200): appointments relevant to the authenticated student

- GET `/student/finance`
  - Success (200): finance document for the student with `balance`

Common Notes
- Authentication: protected endpoints require `Authorization: Bearer <token>` where the token is obtained from `/auth/login`.
- Date fields: use ISO 8601 strings (e.g., `2025-12-24T10:00:00.000Z`).
- IDs: MongoDB ObjectId strings.
- Error responses are forwarded via the global error middleware; typical statuses used: 400, 401, 403, 404, 500.

Files:
- Postman collection: [postman_collection.json](postman_collection.json)
- Quick start: run the server with `node server.js` (ensure `.env` and MongoDB configured)
