import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';

const getAllStudentsFromDB = async () => {
  // query: Record<string, unknown>
  // let searchTerm = '';
  // if (query?.searchTerm) {
  //   searchTerm = query.searchTerm as string;
  // }

  const result = await Student.find()
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const getAStudentFromDB = async (id: string) => {
  // const result = await Student.findOne({ id });

  //using aggregate
  // const result = await Student.aggregate([
  //   //stage -1
  //   { $match: { id: id } },
  // ]);

  const result = await Student.findOne({ id })
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    //check isUser exist using Static Methode
    const studentExist = await Student.isUserExists(id);

    if (studentExist) {
      //Delete student
      const deletedStudent = await Student.findOneAndUpdate(
        { id },
        { isDeleted: true },
        { new: true, session },
      );

      if (!deletedStudent) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Fail to deleted Student');
      }
      return deletedStudent;
    }

    //Now Delete User  //is User Exist ?
    const userExist = await User.isUserExists(id);
    if (userExist) {
      const deletedUser = await User.findOneAndUpdate(
        { id },
        { isDeleted: true },
        { new: true, session },
      );

      if (!deletedUser) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Fail to deleted User');
      }
      return deletedUser;
    }
    // ei stage mane success
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(500, 'Failed to Delete Student');
  }
};

const updateStudentFromDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudent } = payload;
  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudent,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }
  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }
  console.log(modifiedUpdatedData);
  const result = await Student.findOneAndUpdate({ id }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });

  return result;
};
export const StudentServices = {
  getAllStudentsFromDB,
  getAStudentFromDB,
  deleteStudentFromDB,
  updateStudentFromDB,
};
