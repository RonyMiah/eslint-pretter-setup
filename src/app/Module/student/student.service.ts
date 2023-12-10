import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { studentSearchableFields } from './student.constent';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  // //query copy using spreade operator
  // const queryObj = { ...query };
  // // query: Record<string, unknown>
  // const studentSearchableFields = [
  //   'email',
  //   'name.firstName',
  //   'permanentAddress',
  // ];
  // let searchTerm = '';
  // if (query?.searchTerm) {
  //   searchTerm = query?.searchTerm as string;
  // }
  // const searchQuery = Student.find({
  //   $or: studentSearchableFields.map((field) => ({
  //     [field]: { $regex: searchTerm, $options: 'i' },
  //   })),
  // });
  // //recharce regex in in mongoose //await mane promise ta ke resolve kore fela
  // //Filtaring
  // const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
  // excludeFields.forEach((element) => delete queryObj[element]);
  // console.log('baseQuery ', query, 'QueryObjet ', queryObj);
  // const filterQuery = searchQuery
  //   .find(queryObj)
  //   .populate('admissionSemester')
  //   .populate({
  //     path: 'academicDepartment',
  //     populate: {
  //       path: 'academicFaculty',
  //     },
  //   });
  // let sort = '-createdAt';
  // if (query.sort) {
  //   sort = query.sort as string;
  // }
  // // ?sort=-email //desending order sort
  // const sortQuery = filterQuery.sort(sort);

  // //pagination use Formula   >> limit =1, page =2, skip = (page-1)*limit
  // //page=1&limit=2
  // let page = 1;
  // let limit = 1;
  // let skip = 0;
  // if (query.limit) {
  //   limit = Number(query.limit);
  // }
  // if (query.page) {
  //   page = Number(query.page);
  //   skip = (page - 1) * limit;
  // }
  // const paginateQuery = sortQuery.skip(skip);
  // const limitQuery = paginateQuery.limit(limit);

  // //Fields Limiting
  // //.select
  // //?fields=name,email
  // //Remember query object er modde field dewya jabe na becouse its exists match kore
  // // filter korbo select diye jeita amader lagbe oitai dakhabo
  // let fields = '-__v';

  // if (query.fields) {
  //   //now fields type is { fields: 'name,email' } >> remove , and added Space between name and email
  //   fields = (query.fields as string).split(',').join(' '); //now fields :'name email'
  // }

  // const fieldsQuery = await limitQuery.select(fields);
  // return fieldsQuery;

  const studentQuery = new QueryBuilder(
    Student.find(),query)
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;
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
  // console.log(modifiedUpdatedData);
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
