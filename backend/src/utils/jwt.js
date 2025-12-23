import jwt from "jsonwebtoken";

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d", ...options });
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

