import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { getCourses, getAppointments, getFinance } from "../controllers/student.controller.js";

const router = Router();

router.use(auth, allowRoles("STUDENT"));

router.get("/courses", getCourses);
router.get("/appointments", getAppointments);
router.get("/finance", getFinance);

export default router;

