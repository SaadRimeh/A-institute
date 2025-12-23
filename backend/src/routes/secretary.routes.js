// routes/secretary.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import * as ctrl from "../controllers/secretary.controller.js";

const router = Router();

router.use(auth, allowRoles("SECRETARY"));

// Students
router.post("/students", ctrl.createStudent);
router.get("/students", ctrl.getStudents);
router.get("/students/:studentId", ctrl.getStudentById);
router.put("/students/:studentId", ctrl.updateStudent);
router.delete("/students/:studentId", ctrl.deleteStudent);

// Courses
router.post("/courses", ctrl.createCourse);
router.get("/courses", ctrl.getCourses);
router.get("/courses/:courseId", ctrl.getCourseById);
router.put("/courses/:courseId", ctrl.updateCourse);
router.delete("/courses/:courseId", ctrl.deleteCourse);
router.post("/courses/:courseId/register-student", ctrl.registerStudentInCourse);

// Appointments
router.post("/appointments", ctrl.createAppointment);
router.get("/appointments", ctrl.getAppointments);
router.get("/appointments/:appointmentId", ctrl.getAppointmentById);
router.put("/appointments/:appointmentId", ctrl.updateAppointment);
router.delete("/appointments/:appointmentId", ctrl.deleteAppointment);

// Finance
router.post("/finance/:studentId", ctrl.upsertFinance);
router.post("/finance/:studentId/payments", ctrl.addPayment);
router.get("/finance/:studentId", ctrl.getFinanceByStudent);
router.get("/finance/teacher/:teacherId", ctrl.getTeacherEarnings);

export default router;
