import { Request } from 'express';
import { IUser } from '../models/User';

export enum ClearanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const DEPARTMENTS = [
  'Library',
  'Finance',
  'Dormitory',
  'Registrar',
  'Laboratory',
  'Department Head',
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

export interface AuthRequest extends Request {
  user?: IUser;
}
