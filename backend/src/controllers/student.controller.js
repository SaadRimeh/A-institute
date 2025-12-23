import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Appointment from "../models/Appointment.js";
import Finance from "../models/Finance.js";

const getStudentByUser = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    const err = new Error("Student profile not found");
    err.statusCode = 404;
    throw err;
  }
  return student;
};

export const getCourses = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user._id);
    const courses = await Course.find({ _id: { $in: student.courses } }).populate("teacher");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user._id);
    const appointments = await Appointment.find({
      $or: [{ students: student._id }, { course: { $in: student.courses } }]
    })
      .populate("course")
      .populate("teacher");
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const getFinance = async (req, res, next) => {
  try {
    const student = await getStudentByUser(req.user._id);
    const finance = await Finance.findOne({ student: student._id });
    if (!finance) return res.status(404).json({ message: "Finance record not found" });
    res.json({ ...finance.toObject(), balance: finance.balance });
  } catch (err) {
    next(err);
  }
};

