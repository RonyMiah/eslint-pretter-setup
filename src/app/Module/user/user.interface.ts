/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type TUser = {
  id: string;
  password: string;
  needsPasswordChange: boolean;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
};

export interface UsertModel extends Model<TUser> {
  isUserExists(id: string): Promise<TUser | null>;
}

//using partial that's why we don't needed

// export type NewUser = {
//   password: string;
//   role: string;
//   id: string;
// };
