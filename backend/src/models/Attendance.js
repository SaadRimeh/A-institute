// models/Attendance.js
import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    present: { type: Boolean, default: true },
    note: { type: String }
  },
  { timestamps: true }
);

AttendanceSchema.index({ appointment: 1, student: 1 }, { unique: true });

export default mongoose.model("Attendance", AttendanceSchema);
