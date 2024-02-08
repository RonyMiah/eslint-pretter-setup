import { SemesterRegistration } from './../semesterRegistration/semesterRegistration.model';
import { AcademicDepartment } from './../academicDepartment/academicDepartment.model';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { hasTimeConflict } from './offeredCourse.utiles';
import QueryBuilder from '../../builder/QueryBuilder';
import { TOfferedCourse } from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { Student } from '../student/student.model';

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

  /**
   * Step 1: check if the semester registration id is exists!
   * Step 2: check if the academic faculty id is exists!
   * Step 3: check if the academic department id is exists!
   * Step 4: check if the course id is exists!
   * Step 5: check if the faculty id is exists!
   * Step 6: check if the department is belong to the  faculty
   * Step 7: check if the same offered course same section in same registered semester exists
   * Step 8: get the schedules of the faculties
   * Step 9: check if the faculty is available at that time. If not then throw error
   * Step 10: create the offered course
   */

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
  //cheak if the faculty id is exists !
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
  const result = await offeredCourseQuery.modelQuery;
  const meta = await offeredCourseQuery.countTotal();

  return {
    meta,
    result,
  };
};
const getMyOfferedCourseFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  //pagination

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  //find the student
  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found !');
  }
  //find current ongoing semester
  const currentOngoingRegistrationSemester = await SemesterRegistration.findOne(
    {
      status: 'ONGOING',
    },
  );

  if (!currentOngoingRegistrationSemester) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'There is no Ongoing Semester registration !',
    );
  }

  const aggregationQuery = [
    //stage-1 match
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester?._id,
        academicFaculty: student.academicFaculty,
        academicDepartment: student.academicDepartment,
      },
    },
    //stage -2 lookup kotbo kon collection theke oita

    {
      $lookup: {
        from: 'courses',
        localField: 'course', // Bortoman state
        foreignField: '_id', //database collection er _id forenField
        as: 'course',
      },
    },

    //unwind Stage-3 [{}] => {}
    {
      $unwind: '$course',
    },
    //compair enrolledcourses
    {
      $lookup: {
        from: 'enrolledcourses',
        //Match Semester that's why don't need localField
        // variable
        let: {
          currentOngoingRegistrationSemester:
            currentOngoingRegistrationSemester._id,
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                //Multipule Condition er jonno and
                $and: [
                  {
                    $eq: [
                      '$semesterRegistration',
                      '$$currentOngoingRegistrationSemester',
                    ],
                  },
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isEnrolled', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'enrolledCourses',
      },
    },

    //stage -4 lookup again

    {
      $lookup: {
        from: 'enrolledcourses',
        //Match Semester that's why don't need localField
        // variable
        let: {},
        pipeline: [
          {
            $match: {
              $expr: {
                //Multipule Condition er jonno and
                $and: [
                  {
                    $eq: ['$student', student._id],
                  },
                  {
                    $eq: ['$isCompleted', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'completedCourses',
      },
    },
    //stage -5 Complected Course Id new field Added
    {
      $addFields: {
        completedCourseIds: {
          $map: {
            input: '$completedCourses',
            as: 'completed',
            in: '$$completed.course',
          },
        },
      },
    },
    // stage-6 Comparire course and enrolledCourses
    {
      //addFields diye new akta field add kora jay
      $addFields: {
        isPrerequisitesFullFilled: {
          $or: [
            { $eq: ['$course.preRequisiteCourses', []] },
            //Akjectly Match er jonno amra subset user korbo
            {
              $setIsSubset: [
                '$course.preRequisiteCourses.course',
                '$completedCourseIds',
              ],
            },
          ],
        },

        //$in user for array er modhe comparizon and if they are match we are remove those data
        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledCourses',
                as: 'enroll',
                //oporer enroll ke use korer jonno $$ use kora hoitase
                in: '$$enroll.course',
              },
            },
          ],
        },
      },
    },
    //stage -7  Match korbo isAlreadyEnrolled : false
    {
      $match: {
        isAlreadyEnrolled: false,
        isPrerequisitesFullFilled: true,
      },
    },
  ];
  const paginationQuery = [
    //stage -8 skip
    {
      $skip: skip,
    },
    //stage -9 skip
    {
      $limit: limit,
    },
  ];
  const result = await OfferedCourse.aggregate([
    ...aggregationQuery,
    ...paginationQuery,
  ]);

  //paginate
  const total = (await OfferedCourse.aggregate(aggregationQuery)).length;
  const totalPage = Math.ceil(result.length / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
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
  deleteOfferedCourseFromDB,
  getMyOfferedCourseFromDB,
};
