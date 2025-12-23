import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import { signToken } from "../utils/jwt.js";

export const login = async (req, res, next) => {
  try {
    const { loginCode, password } = req.body;
    if (!loginCode) return res.status(400).json({ message: "loginCode or phone is required" });

    const user = await User.findOne({
      $or: [{ loginCode }, { phone: loginCode }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password) {
      const valid = await bcrypt.compare(password || "", user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    } else if (password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user._id, role: user.role });

    let profile = null;
    if (user.role === "STUDENT") {
      profile = await Student.findOne({ user: user._id }).select("-__v");
    } else if (user.role === "TEACHER") {
      profile = await Teacher.findOne({ user: user._id }).select("-__v");
    }

    res.json({ token, role: user.role, profile });
  } catch (err) {
    next(err);
  }
};
