/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { OfferedCourse } from '../OfferedCourse/offeredCourse.model';
import { TEnrolledCourse } from './ entolledCourse.interface';
import EnrolledCourse from './enrolledCourse.model';
import { Student } from '../student/student.model';
import mongoose from 'mongoose';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Course } from '../Course/course.model';
import { Faculty } from '../Faculty/faculty.model';
import { calculateGradePoint } from './enrolledCourse.utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  /**
   * step1 : Check if the offered Course is exists
   * step2 : Check if the student is already enrolled
   * step3: check if the maxCreadits exceed
   * step4 :Create an enrolled course
   */

  const { offeredCourse } = payload;

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found !');
  }

  if (isOfferedCourseExists.maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room is full !');
  }

  const student = await Student.findOne({ id: userId }, { _id: 1 }); // fiell filtaring ...

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }
  const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
    semesterRegistration: isOfferedCourseExists.semesterRegistration,
    offeredCourse,
    student: student._id,
  });

  if (isStudentAlreadyEnrolled) {
    throw new AppError(httpStatus.CONFLICT, 'Student is already enrolled !');
  }

  //Use Aggregate find refarence id Data
  const enrolledCourses = await EnrolledCourse.aggregate([
    //stage -1
    {
      $match: {
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        student: student._id,
      },
    },
    //stage -2
    {
      $lookup: {
        from: 'courses', // database collection name
        localField: 'course',
        foreignField: '_id',
        as: 'enrolledCourseData',
      },
    },
    //stage -3  // Unwind data jodi [{}, {}] array of object thake tahole unwind kore {}Object korte pari
    {
      $unwind: '$enrolledCourseData',
    },
    //stage -4
    {
      $group: {
        _id: null,
        totalEnrolledCreadits: { $sum: '$enrolledCourseData.credits' },
      },
    },
    //stage -5 remove _id ;
    {
      $project: {
        _id: 0,
        totalEnrolledCreadits: 1,
      },
    },
  ]);

  //Check Total Creadite exceeds maxCreadit
  //Total enrolled Creaits + new Enrolled Course Creadit > maxCredit
  const semesterRegId = isOfferedCourseExists?.semesterRegistration;
  const CourseId = isOfferedCourseExists?.course;
  const semesterRegistration =
    await SemesterRegistration.findById(semesterRegId).select('maxCredit');
  const course = await Course.findById(CourseId);
  const currentCredit = course?.credits;
  const maxCreadit = semesterRegistration?.maxCredit;

  const totalCreadits =
    enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCreadits : 0;
  //totalCreadits return 3 or 6 or 18

  if (
    totalCreadits &&
    maxCreadit &&
    totalCreadits + currentCredit > maxCreadit
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have exeeded Maximum number of creadits !',
    );
  }

  //Trasession and Rollback Start
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    //make sure create or read database it's and [{}] Array Of Object
    const result = await EnrolledCourse.create(
      [
        {
          semesterRegistration: isOfferedCourseExists.semesterRegistration,
          academicSemester: isOfferedCourseExists.academicSemester,
          academicFaculty: isOfferedCourseExists.academicFaculty,
          academicDepartment: isOfferedCourseExists.academicDepartment,
          offeredCourse: offeredCourse,
          course: isOfferedCourseExists.course,
          student: student._id,
          faculty: isOfferedCourseExists.faculty,
          isEnrolled: true,
        },
      ],
      { session },
    );

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failedd to enrolled Course !',
      );
    }
    //Max capacity decrement ..
    const maxCapacity = isOfferedCourseExists.maxCapacity;
    await OfferedCourse.findByIdAndUpdate(offeredCourse, {
      maxCapacity: maxCapacity - 1,
    });

    //Commit Session and End Session
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error: any) {
    //When error occurd session abort and end
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const getMyEnrolledCoursesFromDB = async (
  studentId: string,
  query: Record<string, unknown>,
) => {
  const student = await Student.findOne({ id: studentId });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student Not Found !');
  }

  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourse.find({ student: student._id }).populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course student faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enrolledCourseQuery.modelQuery;
  const meta = await enrolledCourseQuery.countTotal();

  return {
    meta,
    result,
  };
};

const updateEnrolledCourseMarksIntoDB = async (
  userId: string,
  payload: Partial<TEnrolledCourse>,
) => {
  const { offeredCourse, semesterRegistration, student, courseMarks } = payload;

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course not found !');
  }
  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester Registration not found !',
    );
  }
  const isStudentExist = await Student.findById(student);
  if (!isStudentExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  //now Faculty Id is - F-0001 to convart mongodb _id
  const faculty = await Faculty.findOne({ id: userId }, { _id: 1 });
  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty  not found !');
  }

  // Auth user token is Currect or wrong check validation
  const isCourseBelongToFaculty = await EnrolledCourse.findOne({
    offeredCourse,
    semesterRegistration,
    student,
    faculty: faculty._id,
  });

  if (!isCourseBelongToFaculty) {
    throw new AppError(httpStatus.FORBIDDEN, 'You ara forbidden !');
  }

  // console.log(isCourseBelongToFaculty);

  //Update Softly or  GressFully Update
  const modifiedData: Record<string, unknown> = {
    ...courseMarks,
  };

  if (courseMarks?.finalTerm) {
    const { classTest1, classTest2, midTerm, finalTerm } =
      isCourseBelongToFaculty.courseMarks;

    const totalMarks =
      Math.ceil(classTest1) +
      Math.ceil(classTest2) +
      Math.ceil(midTerm) +
      Math.ceil(finalTerm);
    const result = calculateGradePoint(totalMarks);
    modifiedData.grade = result.grade;
    modifiedData.gradePoints = result.gradePoints;
    modifiedData.isCompleted = true;
  }

  if (courseMarks && Object.keys(courseMarks)) {
    for (const [key, value] of Object.entries(courseMarks)) {
      modifiedData[`courseMarks.${key}`] = value;
    }
  }

  const result = await EnrolledCourse.findOneAndUpdate(
    isCourseBelongToFaculty._id,
    modifiedData,
    {
      new: true, // new true dile updated data result aa diye dibe
    },
  );
  return result;
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  getMyEnrolledCoursesFromDB,
  updateEnrolledCourseMarksIntoDB,
};
