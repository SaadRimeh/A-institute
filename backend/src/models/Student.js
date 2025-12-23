// models/Student.js
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    age: { type: Number, required: true },
    parentPhone: {
      type: String,
      required: function () {
        return this.age < 18;
      }
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
  },
  { timestamps: true }
);

export default mongoose.model("Student", StudentSchema);
