**API Endpoints**

- **Base URL:** `{{baseUrl}}` (Postman variable in the included collection)

**Auth**
- POST `/auth/login` : Log in using `loginCode` or phone. Example body:

  {
  "loginCode": "<loginCode or phone>",
  "password": "<password if set>"
  }

  Response: `{ token, role, profile }` — copy `token` to Postman `{{token}}` variable for authenticated requests.

**Secretary (requires SECRETARY role + Authorization header `Bearer {{token}}`)**
- POST `/secretary/students` : Create student. Body example includes `fullName`, `phone`, `age`, `parentPhone` (required if age < 18), optional `courses`, `password`.
- GET `/secretary/students` : List students.
- GET `/secretary/students/:studentId` : Get student by id.
- PUT `/secretary/students/:studentId` : Update student fields.
- DELETE `/secretary/students/:studentId` : Delete student.

- POST `/secretary/courses` : Create course. Body: `{ name, description, teacherId, price }`.
- GET `/secretary/courses` : List courses.
- GET `/secretary/courses/:courseId` : Get course.
- PUT `/secretary/courses/:courseId` : Update course.
- DELETE `/secretary/courses/:courseId` : Delete course.
- POST `/secretary/courses/:courseId/register-student` : Body `{ studentId }` to register student.

- POST `/secretary/appointments` : Create appointment. Body example: `{ courseId, teacherId, date, durationMinutes, notes, students: [] }`.
- GET `/secretary/appointments` : List.
- GET `/secretary/appointments/:appointmentId` : Get by id.
- PUT `/secretary/appointments/:appointmentId` : Update.
- DELETE `/secretary/appointments/:appointmentId` : Delete.

- POST `/secretary/finance/:studentId` : Upsert finance record. Body `{ totalDue, notes }`.
- POST `/secretary/finance/:studentId/payments` : Add payment. Body `{ amount, method }`.
- GET `/secretary/finance/:studentId` : Get finance for student.
- GET `/secretary/finance/teacher/:teacherId` : Get teacher earnings (aggregate of students in teacher's courses).

**Teacher (requires TEACHER role + Authorization)**
- GET `/teacher/appointments` : Appointments for the authenticated teacher.
- GET `/teacher/courses/:courseId/students` : Students for a teacher's course.
- POST `/teacher/attendance` : Record attendance. Body `{ appointmentId, records: [{ studentId, present, note }] }`.
- GET `/teacher/attendance` : Get attendance records for teacher's appointments.
- GET `/teacher/finance` : Teacher earnings summary (paid/outstanding).

**Student (requires STUDENT role + Authorization)**
- GET `/student/courses` : Courses for authenticated student.
- GET `/student/appointments` : Appointments relevant to the student.
- GET `/student/finance` : Finance record for authenticated student.

**Quick Postman import & usage**

1. Open Postman and import the file `postman_collection.json` from the project folder.
2. Set environment variable `baseUrl` if needed (default `http://localhost:5000/api/v1`).
3. Run `Auth -> Login` with a `loginCode` or phone. Copy the returned `token` and set Postman variable `token`.
4. Use the collection requests (they include `Authorization: Bearer {{token}}`).

**Files**
- Postman collection: [postman_collection.json](postman_collection.json)
- App entry: [server.js](server.js)
- Express mounting: [src/app.js](src/app.js#L1-L50)
