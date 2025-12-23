import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Appointment from "../models/Appointment.js";
import Attendance from "../models/Attendance.js";
import Finance from "../models/Finance.js";
import generateLoginCode from "../utils/generateLoginCode.js";
import { ROLES } from "../utils/roles.js";

const ensureTeacher = async (teacherId) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");
  return teacher;
};

export const createStudent = async (req, res, next) => {
  try {
    const { fullName, phone, age, parentPhone, courses = [], password } = req.body;
    if (age < 18 && !parentPhone) {
      return res.status(400).json({ message: "Parent phone is required for students under 18" });
    }

    const loginCode = generateLoginCode();
    const user = await User.create({ role: ROLES.STUDENT, phone, loginCode, password });

    const student = await Student.create({
      user: user._id,
      fullName,
      phone,
      age,
      parentPhone,
      courses
    });

    if (courses.length) {
      await Course.updateMany({ _id: { $in: courses } }, { $addToSet: { students: student._id } });
    }

    await Finance.create({ student: student._id, totalDue: 0, paid: 0 });

    res.status(201).json({ student, loginCode });
  } catch (err) {
    next(err);
  }
};

export const getStudents = async (_req, res, next) => {
  try {
    const students = await Student.find().populate("courses").populate("user", "-password");
    res.json(students);
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId).populate("courses").populate("user", "-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { fullName, phone, age, parentPhone, courses } = req.body;
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (age !== undefined && age < 18 && !parentPhone && !student.parentPhone) {
      return res.status(400).json({ message: "Parent phone is required for students under 18" });
    }

    if (fullName !== undefined) student.fullName = fullName;
    if (phone !== undefined) student.phone = phone;
    if (age !== undefined) student.age = age;
    if (parentPhone !== undefined) student.parentPhone = parentPhone;

    if (Array.isArray(courses)) {
      // remove student from old courses not in new list
      const current = student.courses.map((c) => c.toString());
      const incoming = courses.map((c) => c.toString());
      const toRemove = current.filter((id) => !incoming.includes(id));
      const toAdd = incoming.filter((id) => !current.includes(id));
      if (toRemove.length) {
        await Course.updateMany({ _id: { $in: toRemove } }, { $pull: { students: student._id } });
      }
      if (toAdd.length) {
        await Course.updateMany({ _id: { $in: toAdd } }, { $addToSet: { students: student._id } });
      }
      student.courses = incoming;
    }

    await student.save();
    res.json(student);
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Course.updateMany({ _id: { $in: student.courses } }, { $pull: { students: student._id } });
    await Finance.deleteOne({ student: student._id });
    await User.deleteOne({ _id: student.user });
    await student.deleteOne();

    res.json({ message: "Student deleted" });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { name, description, teacherId, price } = req.body;
    const teacher = await ensureTeacher(teacherId);
    const course = await Course.create({ name, description, teacher: teacher._id, price });
    await Teacher.updateOne({ _id: teacher._id }, { $addToSet: { courses: course._id } });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const getCourses = async (_req, res, next) => {
  try {
    const courses = await Course.find().populate("teacher").populate("students");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate("teacher").populate("students");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { name, description, teacherId, price } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (teacherId && teacherId !== course.teacher.toString()) {
      const newTeacher = await ensureTeacher(teacherId);
      await Teacher.updateOne({ _id: course.teacher }, { $pull: { courses: course._id } });
      await Teacher.updateOne({ _id: newTeacher._id }, { $addToSet: { courses: course._id } });
      course.teacher = newTeacher._id;
    }
    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;

    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    await Teacher.updateOne({ _id: course.teacher }, { $pull: { courses: course._id } });
    await Student.updateMany({ _id: { $in: course.students } }, { $pull: { courses: course._id } });
    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

export const registerStudentInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    const course = await Course.findById(courseId);
    const student = await Student.findById(studentId);

    if (!course || !student) return res.status(404).json({ message: "Course or Student not found" });

    await Course.updateOne({ _id: courseId }, { $addToSet: { students: student._id } });
    await Student.updateOne({ _id: studentId }, { $addToSet: { courses: course._id } });
    await Finance.updateOne({ student: student._id }, { $inc: { totalDue: course.price } }, { upsert: true });

    res.json({ message: "Student registered to course" });
  } catch (err) {
    next(err);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { courseId, teacherId, date, durationMinutes, notes, students = [] } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (teacherId && course.teacher.toString() !== teacherId) {
      return res.status(400).json({ message: "Teacher does not belong to this course" });
    }
    const appointment = await Appointment.create({
      course: courseId,
      teacher: teacherId || course.teacher,
      date,
      durationMinutes,
      notes,
      students
    });
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (_req, res, next) => {
  try {
    const list = await Appointment.find().populate("course").populate("teacher").populate("students");
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate("course")
      .populate("teacher")
      .populate("students");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { date, durationMinutes, notes, students } = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (date !== undefined) appointment.date = date;
    if (durationMinutes !== undefined) appointment.durationMinutes = durationMinutes;
    if (notes !== undefined) appointment.notes = notes;
    if (Array.isArray(students)) appointment.students = students;

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    await Attendance.deleteMany({ appointment: appointment._id });
    await appointment.deleteOne();
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    next(err);
  }
};

export const upsertFinance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { totalDue, notes } = req.body;
    const finance = await Finance.findOneAndUpdate(
      { student: studentId },
      { $set: { totalDue, notes } },
      { upsert: true, new: true }
    );
    res.json(finance);
  } catch (err) {
    next(err);
  }
};

export const addPayment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { amount, method } = req.body;
    const finance = await Finance.findOne({ student: studentId });
    if (!finance) return res.status(404).json({ message: "Finance record not found" });
    finance.payments.push({ amount, method });
    finance.paid += Number(amount || 0);
    await finance.save();
    res.json(finance);
  } catch (err) {
    next(err);
  }
};

export const getFinanceByStudent = async (req, res, next) => {
  try {
    const finance = await Finance.findOne({ student: req.params.studentId }).populate("student");
    if (!finance) return res.status(404).json({ message: "Finance record not found" });
    res.json({ ...finance.toObject(), balance: finance.balance });
  } catch (err) {
    next(err);
  }
};

export const getTeacherEarnings = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const courses = await Course.find({ teacher: teacherId }).populate("students");
    const studentIds = [...new Set(courses.flatMap((c) => c.students.map((s) => s._id || s)))];
    const finances = await Finance.find({ student: { $in: studentIds } });
    const paid = finances.reduce((sum, f) => sum + f.paid, 0);
    const due = finances.reduce((sum, f) => sum + f.balance, 0);
    res.json({ teacherId, paid, outstanding: due });
  } catch (err) {
    next(err);
  }
};

