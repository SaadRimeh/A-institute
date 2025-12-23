import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getAppointments,
  getStudentsInCourse,
  recordAttendance,
  getAttendance,
  getFinance
} from "../controllers/teacher.controller.js";

const router = Router();

router.use(auth, allowRoles("TEACHER"));

router.get("/appointments", getAppointments);
router.get("/courses/:courseId/students", getStudentsInCourse);
router.post("/attendance", recordAttendance);
router.get("/attendance", getAttendance);
router.get("/finance", getFinance);

export default router;

