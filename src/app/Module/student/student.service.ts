import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';

import { studentSearchableFields } from './student.constent';
import QueryBuilder from '../../builder/QueryBuilder';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  //search field

  //{email : {$regex : query.searchTerm , $option: i}}
  //{presentAddress : {$regex : query.searchTerm , $option: i}}
  //copy query obj
  //   const queryObject = { ...query };
  //   let searchTerm = ' ';
  //   if (query.searchTerm) {
  //     searchTerm = query.searchTerm as string;
  //   }
  //   const searchableQuery = Student.find({
  //     $or: studentSearchableFields.map((field) => ({
  //       [field]: { $regex: searchTerm, $options: 'i' },
  //     })),
  //   });

  //Filtaring delete [] element
  //   ['searchTerm', 'page', 'sort', 'limit', 'fields'].forEach(
  //     (ele) => delete queryObject[ele],
  //   );

  //   const filterQuery = searchableQuery
  //     .find(queryObject)
  //     .populate('admissionSemester')
  //     .populate({
  //       path: 'academicDepartment',
  //       populate: {
  //         path: 'academicFaculty',
  //       },
  //     });

  //sort
  //   let sort = '-createdAt';
  //   if (query.sort) {
  //     sort = query?.sort as string;
  //   }
  //   const sortQuery = filterQuery.sort(sort);

  //limit
  //   let page = 1;
  //   let limit = 1;
  //   let skip = 0;

  //   if (query.limit) {
  //     limit = Number(query?.limit);
  //   }
  //   if (query.page) {
  //     page = Number(query?.page);
  //   }
  //   if (query.skip) {
  //     skip = (page - 1) * limit;
  //   }

  //page query
  //   const pageQuery = sortQuery.skip(skip);

  //limit query
  //   const limitQuery = pageQuery.limit(limit);

  //fields limiting
  // fields: 'name,email' convart to ....   firlds: name email  ..
  //   let fields = '-__v';
  //   if (query.fields) {
  //     fields = (query.fields as string).split(',').join(' ');
  //   }

  //fields er bitore 2 ta value thakle amra select query use korbo
  //jei fields show kora dorkar sei fields er jonno select use korte pari
  //bandwidth cost komanor jonno .select methode use korte pari
  //   const fieldQuery = await limitQuery.select(fields);

  // console.log('base query', query);
  // console.log(queryObject);

  //   return fieldQuery;

  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('user')
      .populate('admissionSemester')
      .populate('academicDepartment academicFaculty'),
    query,
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;
  const meta = await studentQuery.countTotal();
  return {
    meta,
    result,
  };
};

const getAStudentFromDB = async (id: string) => {
  // const result = await Student.findOne({ id });

  //using aggregate
  // const result = await Student.aggregate([
  //   { $match: { id: id } },
  // ]);

  const result = await Student.findById(id)

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
    // const studentExist = await Student.isUserExists(id);

    //Delete student
    const deletedStudent = await Student.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Fail to deleted Student');
    }

    //get user _id from DeletedFaculty
    const userId = deletedStudent?.user;
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Fail to deleted User');
    }

    // ei stage mane success
    await session.commitTransaction();
    await session.endSession();
    return deletedUser;
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
  // console.log(modifiedUpdatedData);
  const result = await Student.findByIdAndUpdate(id, modifiedUpdatedData, {
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
