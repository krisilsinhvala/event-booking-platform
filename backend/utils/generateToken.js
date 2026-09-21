import jwt from 'jsonwebtoken';
import { environment } from '../config/env.js';

const generateToken = (user) => {
  if (!environment.jwtSecret) {
    throw new Error('JWT_SECRET is not configured. Add it to backend/.env.');
  }

  return jwt.sign(
    {
      role: user.role
    },
    environment.jwtSecret,
    {
      subject: user._id.toString(),
      expiresIn: environment.jwtExpiresIn
    }
  );
};

export default generateToken;