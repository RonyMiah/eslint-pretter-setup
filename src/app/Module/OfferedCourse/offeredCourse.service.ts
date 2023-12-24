import { SemesterRegistration } from './../semesterRegistration/semesterRegistration.model';
import { AcademicDepartment } from './../academicDepartment/academicDepartment.model';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { TOfferedCourse } from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { hasTimeConflict } from './offeredCourse.utiles';
import QueryBuilder from '../../builder/QueryBuilder';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload;

  //check if the semester registration id is exists  !
  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);

  if (!isSemesterRegistrationExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Semester Registration not found');
  }
  //set academicSemester  and pass result variable
  const academicSemester = isSemesterRegistrationExists.academicSemester;
  //cheak if the academicFaculty id is exists !
  const isAcademicFacultyExists =
    await AcademicFaculty.findById(academicFaculty);

  if (!isAcademicFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Faculty  not found');
  }
  //cheak if the academicDepartment id is exists !
  const isAcademicDepartmentExists =
    await AcademicDepartment.findById(academicDepartment);

  if (!isAcademicDepartmentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic Department  not found');
  }
  //cheak if the course id is exists !
  const isCourseExists = await Course.findById(course);

  if (!isCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not ound');
  }
  //cheak if the course id is exists !
  const isFacultyExists = await Faculty.findById(faculty);

  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not ound');
  }

  //check if the department is belong to the faculty
  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });

  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `This ${isAcademicDepartmentExists.name} is not belong to this${isAcademicFacultyExists.name}`,
    );
  }

  //check if the same course same section in same registered semester exists
  const isSameOfferedCourseAndSameSectionAndSameRegisterSemesterExists =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    });
  if (isSameOfferedCourseAndSameSectionAndSameRegisterSemesterExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'OfferCourse with same section is already exist ',
    );
  }
  // get the schedules of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days }, //day diya filter payload thaika ja asbo days hisabe oigola filter kore dakhabe
  }).select('days startTime endTime');

  // //return type ta eirokom asbe   [ {
  //   _id: new ObjectId('6585fa741824114b386a7e1a'),
  //   days: [ 'Sun', 'Mon' ],
  //days diya filter hobe sat , sun dile sat sun day er data dibe sun > mon dile sun to mon day er jei data ase oigola dibe
  //   startTime: '10:30',
  //   endTime: '12:30'
  // } ],

  // console.log(assignedSchedules);

  const newSchedules = {
    days,
    startTime,
    endTime,
  };
  //utils function
  if (hasTimeConflict(assignedSchedules, newSchedules)) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This Faculty is not avalable at that time Choose other time or day ',
    );
  }

  const result = await OfferedCourse.create({ ...payload, academicSemester });
  return result;
};

const getAllOfferedCourseFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(OfferedCourse.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = offeredCourseQuery.modelQuery;
  return result;
};

const getSingleOfferedCourseFromDB = async (id: string) => {
  const offeredCourse = await OfferedCourse.findById(id);
  if (!offeredCourse) {
    throw new AppError(404, 'OfferedCourse not found');
  }
  return offeredCourse;
};

const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>,
) => {
  //Only Upcoming obostay update hobe Ongoing or Ended thakle update hobe na

  const { faculty, days, startTime, endTime } = payload;
  const isOfferedCourseExist = await OfferedCourse.findById(id);

  if (!isOfferedCourseExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }
  const isFacultyExists = await Faculty.findById(faculty);

  if (!isFacultyExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty   not found');
  }

  const semesterRegistration = isOfferedCourseExist.semesterRegistration;

  //check status is "UPCOMING" or not
  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration);

  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offerd course as it is ${semesterRegistrationStatus?.status} `,
    );
  }

  // get the schedules of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days }, //day diya filter payload thaika ja asbo days hisabe oigola filter kore dakhabe
  }).select('days startTime endTime');
  const newSchedules = {
    days,
    startTime,
    endTime,
  };
  //utils function
  if (hasTimeConflict(assignedSchedules, newSchedules)) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This Faculty is not avalable at that time Choose other time or day ',
    );
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteOfferedCourseFromDB = async (id: string) => {
  /**
   * step 1 : check it he offered course exists
   * step 2: check if the semester registration status is upcoming
   * step 3: delete the offered course
   */
  const isOfferedCourseExist = await OfferedCourse.findById(id);

  if (!isOfferedCourseExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }
  const semesterRegistation = isOfferedCourseExist.semesterRegistration;
  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistation);

  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course can not update ! because the semester ${semesterRegistrationStatus}`,
    );
  }
  const result = await OfferedCourse.findByIdAndDelete(id);
  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  getAllOfferedCourseFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
  deleteOfferedCourseFromDB
};
