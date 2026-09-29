import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
