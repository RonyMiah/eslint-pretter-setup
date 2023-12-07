/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../error/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';
import httpStatus from 'http-status';

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

  //start transation
  const session = await mongoose.startSession();
  try {
    //start transation
    session.startTransaction();
    //set Auto generated id  // userData.id = '2030010001';
    userData.id = await generateStudentId(admissionSemester);

    //(transition -1)
    // create a user
    const newUser = await User.create([userData], { session }); //now it's array becouse we use transation

    //create a student
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Fail to Create User');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //reference _id

    // Transation -2
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

export const UserServices = {
  createStudentIntoDB,
};
