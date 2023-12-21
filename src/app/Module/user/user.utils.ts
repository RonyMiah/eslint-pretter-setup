//eita sodo user er sathe releted jer karone amra user folder er bitore declar korlam

import { TAcademicSemester } from '../academicSemester/academicsemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
  const lastStudent = await User.findOne(
    {
      role: 'student',
    },
    {
      //fill filtaring which data is shown

      id: 1, // we need id not need _id
      _id: 0,
    },
  )
    //sort filter dependences is createdAt
    .sort({ createdAt: -1 }) //letest user sort () and show database number one position
    .lean(); // query fastest er jonno use kora hoy but eitar pore query kora jabe na

  return lastStudent?.id ? lastStudent.id : undefined; // student id paile ok na paile undefine
};

// year >> semestercode >> 4 digit generatedNumber >> 0001   .. such as 2030 01 0001
export const generateStudentId = async (payload: TAcademicSemester) => {
  let currentId = (0).toString();
  const lastStudentId = await findLastStudentId();

  //student id is stored lastStudentId variable 2030 01 00001 >>
  //sting theke kono kiso bad dewyer jonno amra substring use kori
  const lastStudentSemesterCode = lastStudentId?.substring(4, 6); //01
  const lastStudentYear = lastStudentId?.substring(0, 4); //2030
  const currentSemesterCode = payload?.code;
  const currentYear = payload?.year;

  if (
    lastStudentId &&
    lastStudentSemesterCode === currentSemesterCode &&
    lastStudentYear === currentYear
  ) {
    currentId = lastStudentId.substring(6); //crrent id re asign hobe
  }

  //pad start er kaj holo 4 digit number create korbe 0000 jodi current id te number thake tahole padstartnumber+number bosbe such as >> 0001
  let incrementid = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementid = `${payload.year}${payload.code}${incrementid}`;
  return incrementid;
};

//Faculty ID
export const findLastFacultyId = async () => {
  const lastFaculty = await User.findOne(
    { role: 'faculty' },
    { id: 1, _id: 0 }, //fill filtaring  we need id  not need _id >>
  )
    .sort({ createdAt: -1 })
    .lean(); //query fast er jonno .lean use kora hoise . only use case last ,  er pore are query chalano jabe na
  return lastFaculty?.id ? lastFaculty.id.substring(2) : undefined;
};

export const generateFacultyId = async () => {
  let currentId = (0).toString();
  const lastFacultyId = await findLastFacultyId();

  if (lastFacultyId) {
    currentId = lastFacultyId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `F-${incrementId}`;
  return incrementId;
};

//Admin ID

export const findLastAdminId = async () => {
  const lastAdmin = await User.findOne({ role: 'admin' }, { id: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .lean();

  return lastAdmin?.id ? lastAdmin.id.substring(2) : undefined;
};

export const generateAdminId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastAdminId();

  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `A-${incrementId}`;
  return incrementId;
};
