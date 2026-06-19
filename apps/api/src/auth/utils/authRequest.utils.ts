import { Request as ExpressRequest } from 'express';
import { JwtPayload } from '@food-delivery/types';

export type AuthRequest = ExpressRequest & { user: JwtPayload };
