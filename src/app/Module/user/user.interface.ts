export type TUser = {
  id: string;
  password: string;
  needsPasswordChange: boolean;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
};

//using partial that's why we don't needed

// export type NewUser = {
//   password: string;
//   role: string;
//   id: string;
// };
