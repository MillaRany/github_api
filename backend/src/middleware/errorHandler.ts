import { Request, Response, NextFunction } from 'express';

interface ErrorMapping {
  status: number;
  message: string;
}

const errorMap: Record<string, ErrorMapping> = {
  'Email already in use': { status: 409, message: 'Email already in use' },
  'Invalid credentials': { status: 401, message: 'Invalid credentials' },
  'Unauthorized': { status: 401, message: 'Unauthorized' },
  'User not found': { status: 404, message: 'User not found' },
  'Failed to fetch users': { status: 500, message: 'Failed to fetch users' },
  'Failed to fetch user': { status: 500, message: 'Failed to fetch user' },
  'Failed to create user': { status: 500, message: 'Failed to create user' },
  'Email and password are required': { status: 400, message: 'Email and password are required' },
  'Password is required': { status: 400, message: 'Password is required' },
  'Name, email, password, and role are required': { status: 400, message: 'Name, email, password, and role are required' },
  'Failed to delete user': { status: 500, message: 'Failed to delete user' }
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message);

  if (err.message.includes('UNIQUE constraint failed')) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const mappedError = errorMap[err.message];
  console.log('Mapped Error:', mappedError);
  if (mappedError) {
    return res.status(mappedError.status).json({ error: mappedError.message });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
