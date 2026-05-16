import { Request } from 'express';

export interface JwtUserPayload {
  id: number;
  username: string;
  is_admin: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}
