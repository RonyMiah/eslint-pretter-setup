/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TSemesterRegistration } from './semesterRegistration.interface';

import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { SemesterRegistration } from './semesterRegistration.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { RegistrationStatus } from './semesterRegistration.constant';
import { semesterRegistrationControllers } from './semesterRegistration.controller';
import mongoose from 'mongoose';
import { OfferedCourse } from '../OfferedCourse/offeredCourse.model';

const createSemesterRegistrationIntoDB = async (
  payload: TSemesterRegistration,
) => {
  const academicSemester = payload?.academicSemester;

  //check if there any register semester that is already 'UPCOMING' / "ONGOING"

  const isThereAnyUpcomingOrOnGoingSemester =
    await SemesterRegistration.findOne({
      $or: [
        { status: RegistrationStatus.UPCOMING },
        { status: RegistrationStatus.UPCOMING },
      ],
    });

  if (isThereAnyUpcomingOrOnGoingSemester) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `There is already a${isThereAnyUpcomingOrOnGoingSemester.status} registered semester !`,
    );
  }

  //check the Academic Semester is exists
  const isAcademicSemesterExists =
    await AcademicSemester.findById(academicSemester);
  if (!isAcademicSemesterExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This semester not found');
  }

  //check if the semester Registeration is already registered
  const isSemesterRegistrationExists = await SemesterRegistration.findOne({
    academicSemester,
  });

  if (isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This Semester is already registered  ',
    );
  }

  const result = await SemesterRegistration.create(payload);
  return result;
};

const getAllSemesterRegistrationFromDB = async (
  query: Record<string, unknown>,
) => {
  const semesterRegistrationQuery = new QueryBuilder(
    SemesterRegistration.find().populate('academicSemester'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await semesterRegistrationQuery.modelQuery;
  const meta = await semesterRegistrationQuery.countTotal();
  return { meta, result };
};

const getSingleRegistrationFromDB = async (id: string) => {
  const result = await SemesterRegistration.findById(id);
  return result;
};
const updateRegistrationFromDB = async (
  id: string,
  payload: Partial<TSemesterRegistration>,
) => {
  //check if the requested registered semester is exists

  const isSemesterRegistrationExists = await SemesterRegistration.findById(id);
  if (!isSemesterRegistrationExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This Semester is not Found');
  }

  //if the requested semester registration is ended , we will not update anything

  const currentSemesterStatus = isSemesterRegistrationExists?.status;
  const requestSemester = payload?.status;

  if (currentSemesterStatus === RegistrationStatus.ENDED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This Semester is already ${currentSemesterStatus}  `,
    );
  }
  //upcoming or ongoing obostay new semster create kora jabe na upcoming => ongoing => ended  eivabe jaite hobe ulta asa jabe na and upcoming theke ended ew jawya jabe na
  //data flow upcomint > ongoing > ended
  if (
    currentSemesterStatus === RegistrationStatus.UPCOMING &&
    requestSemester === RegistrationStatus.ENDED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You Can't Change Status from ${currentSemesterStatus}  to ${requestSemester} `,
    );
  }
  if (
    currentSemesterStatus === RegistrationStatus.ONGOING &&
    requestSemester === RegistrationStatus.UPCOMING
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You Can't Change Status from ${currentSemesterStatus}  to ${requestSemester} `,
    );
  }

  const result = await SemesterRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};
const deleteRegistrationFromDB = async (id: string) => {
  /**
   * setp1: Delete associated offered Courses
   * step 2: Delete semester registration when the status is 'UPCOMING
   */

  // checking if the semester registration is exists
  const isSemesterRegistrationExists = await SemesterRegistration.findById(id);

  if (!semesterRegistrationControllers) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This registration semester is not found !',
    );
  }
  //checking if the status is still 'UPCOMING'
  const semesterRegistrationStatus = isSemesterRegistrationExists?.status;
  if (semesterRegistrationStatus !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update as the registered semester is ${semesterRegistrationStatus}`,
    );
  }

  const session = await mongoose.startSession();

  //deleting associated offered course
  try {
    session.startTransaction();
    const deletedOfferdCourse = await OfferedCourse.deleteMany(
      {
        semesterRegistration: id,
      },
      {
        session,
      },
    );

    if (!deletedOfferdCourse) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to delete semester registration !',
      );
    }

    const deletedSemesterRegistration =
      await SemesterRegistration.findByIdAndDelete(id, {
        session,
        new: true,
      });
    if (!deletedSemesterRegistration) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to delete semester registration !',
      );
      await session.commitTransaction();
      await session.endSession();
      return null;
    }
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};
export const SemesterRegistrationServices = {
  createSemesterRegistrationIntoDB,
  getAllSemesterRegistrationFromDB,
  getSingleRegistrationFromDB,
  updateRegistrationFromDB,
  deleteRegistrationFromDB,
};
