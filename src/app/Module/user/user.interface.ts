/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser {
  id: string;
  email: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;
  role: 'superAdmin' | 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}

export interface UsertModel extends Model<TUser> {
  isUserExists(id: string): Promise<TUser | null>;
  isPasswordMatch(
    plaintextPassword: string,
    hasedPassword: string,
  ): Promise<boolean>;
  isBlockedUser(user: TUser): Promise<boolean>;
  isDeleted(user: TUser): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangeTimeStamp: Date,
    jwtIssouedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
