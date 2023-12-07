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

      id: 1,
      _id: 0,
    },
  )
    //sort filter dependences is createdAt
    .sort({ createdAt: -1 }) //letest user sort () and show database number one position
    .lean();

  //sting theke kono kiso bad dewyer jonno amra substring use kori
  return lastStudent?.id ? lastStudent.id : undefined;
};

// year >> semestercode >> 4 digit generatedNumber >> 0001
export const generateStudentId = async (payload: TAcademicSemester) => {
  let currentId = (0).toString();
  const lastStudentId = await findLastStudentId();

  //student id is stored lastStudentId variable 2030 01 00001
  const lastStudentSemesterCode = lastStudentId?.substring(4, 6);
  const lastStudentYear = lastStudentId?.substring(0, 4);
  const currentSemesterCode = payload?.code;
  const currentYear = payload?.year;

  if (
    lastStudentId &&
    lastStudentSemesterCode === currentSemesterCode &&
    lastStudentYear === currentYear
  ) {
    currentId = lastStudentId.substring(6);
  }

  let incrementid = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementid = `${payload.year}${payload.code}${incrementid}`;
  return incrementid;
};
