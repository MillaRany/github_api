import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '30m';

export const generateToken = (payload: JWTPayload): string => {
  const token = jwt.sign(
    payload, 
    JWT_SECRET, 
    { 
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] 
    }
  );
  return token;
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};