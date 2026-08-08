import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_ACCESS_SECRET || 'replace-with-a-long-random-secret';
const EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1d';

export interface TokenPayload {
  id: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as any });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET) as TokenPayload;
};
