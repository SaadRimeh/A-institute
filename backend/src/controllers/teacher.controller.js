import Teacher from "../models/Teacher.js";
import Appointment from "../models/Appointment.js";
import Course from "../models/Course.js";
import Attendance from "../models/Attendance.js";
import Finance from "../models/Finance.js";

const getTeacherByUser = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId });
  if (!teacher) {
    const err = new Error("Teacher profile not found");
    err.statusCode = 404;
    throw err;
  }
  return teacher;
};

export const getAppointments = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUser(req.user._id);
    const appointments = await Appointment.find({ teacher: teacher._id })
      .populate("course")
      .populate("students");
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const getStudentsInCourse = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUser(req.user._id);
    const course = await Course.findById(req.params.courseId).populate("students");
    if (!course || course.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not allowed to view students for this course" });
    }
    res.json(course.students);
  } catch (err) {
    next(err);
  }
};

export const recordAttendance = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUser(req.user._id);
    const { appointmentId, records = [] } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: "Not allowed to record attendance" });
    }

    const operations = await Promise.all(
      records.map((rec) =>
        Attendance.findOneAndUpdate(
          { appointment: appointmentId, student: rec.studentId },
          { $set: { present: rec.present, note: rec.note } },
          { upsert: true, new: true }
        )
      )
    );

    res.status(201).json(operations);
  } catch (err) {
    next(err);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUser(req.user._id);
    const appointments = await Appointment.find({ teacher: teacher._id }).select("_id");
    const attendance = await Attendance.find({ appointment: { $in: appointments.map((a) => a._id) } })
      .populate("appointment")
      .populate("student");
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

export const getFinance = async (req, res, next) => {
  try {
    const teacher = await getTeacherByUser(req.user._id);
    const courses = await Course.find({ teacher: teacher._id }).populate("students");
    const studentIds = [...new Set(courses.flatMap((c) => c.students.map((s) => s._id || s)))];
    const finances = await Finance.find({ student: { $in: studentIds } });
    const paid = finances.reduce((sum, f) => sum + f.paid, 0);
    const balance = finances.reduce((sum, f) => sum + f.balance, 0);
    res.json({ paid, outstanding: balance });
  } catch (err) {
    next(err);
  }
};

