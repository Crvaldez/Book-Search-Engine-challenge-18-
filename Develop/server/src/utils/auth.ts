// server/src/utils/auth.ts
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';
const expiration = '2h';

interface JwtPayload {
  _id: string;
  email: string;
  username: string;
}

export function signToken({ username, email, _id }: JwtPayload) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

export function authMiddleware({ req }: { req: Request }) {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.split(' ').pop()!.trim();
  }

  if (!token) {
    return { user: null };
  }

  try {
    const { data } = jwt.verify(token, secret) as { data: JwtPayload };
    return { user: data };
  } catch {
    console.log('Invalid token');
    return { user: null };
  }
}
