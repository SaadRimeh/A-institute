// models/Finance.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String }
  },
  { _id: false }
);

const FinanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    totalDue: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    payments: [PaymentSchema],
    notes: String
  },
  { timestamps: true }
);

FinanceSchema.virtual("balance").get(function () {
  return this.totalDue - this.paid;
});

export default mongoose.model("Finance", FinanceSchema);
