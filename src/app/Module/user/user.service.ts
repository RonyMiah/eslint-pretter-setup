/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../error/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';
import httpStatus from 'http-status';
import { TFaculty } from '../Faculty/faculty.interface';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Faculty } from '../Faculty/faculty.model';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'student';

  //find acadamic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  if (!admissionSemester) {
    throw new AppError(404, ' Admition Semester Not Found');
  }

  //create a session from mongoose
  const session = await mongoose.startSession();

  try {
    //start transation
    session.startTransaction();

    //set Auto generated id  // userData.id = '2030010001';
    userData.id = await generateStudentId(admissionSemester);

    // create a user(transition -1)
    const newUser = await User.create([userData], { session }); //now it's array becouse we use transation

    //create a student
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Fail to Create User');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // Transation -2 create a student
    const newStudent = await Student.create([payload], { session }); //array
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Fail to Create Student');
    }

    await session.commitTransaction();
    await session.endSession();

    return newStudent;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(500, 'Failed to create Student');
  }
};

const createFacultyIntoDB = async (password: string, payload:TFaculty ) => {
  //create a user object
  const userData: Partial<TUser> = {};

  //if password is not given use default password
  userData.password = password || (config.default_password as string);
  //set student role
  userData.role = 'faculty';

  //find academic department info
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(400, 'Academic Department not found');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set generated id
    userData.id = await generateFacultyId();

    //create a user (transition -1)
    const newUser = await User.create([userData], { session }); //array

    //create a faculty
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Faild to create faculty');
    }

    //set id and set _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //refarence _id
    // create a faculty (transaction-2)

    const newFaculty = await Faculty.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create faculty');
    }
    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const createAdminIntoDB = async (password: string, payload: TAdmin) => {
  //create a user object
  const userData: Partial<TUser> = {};

  //if password is not given , use deafult password
  userData.password = password || (config.default_password as string);

  //set student role
  userData.role = 'admin';

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set genarated id
    userData.id = await generateAdminId();
    //create a user (transition -1 )
    const newUser = await User.create([userData], { session });

    //create a admin
    if (!newUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Faild to create Admin');
    }
    //set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //refarence _id

    //create a admin
    const newAdmin = await Admin.create([payload], { session });
    if (!newAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Faild to create Admin');
    }

    await session.commitTransaction();
    await session.endSession();
    return newAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

export const UserServices = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
};
