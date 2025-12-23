// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../utils/roles.js";

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: Object.values(ROLES), required: true },
    phone: { type: String, unique: true, sparse: true },
    loginCode: { type: String, unique: true, sparse: true },
    password: { type: String }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.comparePassword = function (candidate) {
  if (!this.password || !candidate) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", UserSchema);
