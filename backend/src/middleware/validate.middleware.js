export const requireFields = (fields = []) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }
  next();
};

export const validateAgeGuard = (req, res, next) => {
  const { age, parentPhone } = req.body;
  if (age !== undefined && Number(age) < 18 && !parentPhone) {
    return res.status(400).json({ message: "Parent phone is required for students under 18" });
  }
  next();
};

