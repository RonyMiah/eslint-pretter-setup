import config from '../../config';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';

import { User } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  // database query choble  mongoose er model er opore
  //চেক সব সময় উপুরে  থাকবে কারণ student create korer pore chek korle kaj nai
  // if (await Student.isUserExists(studentData.id)) {
  //   throw new Error('User already Exists');
  // }

  //create a user object

  const userData: Partial<TUser> = {};

  //if password is not given , use defult password
  userData.password = password || (config.default_password as string);

  //set a student role
  userData.role = 'student';

  //set menually genareted id
  userData.id = '2030100001';
  //create a user
  const newUser = await User.create(userData);

  //create a student

  if (Object.keys(newUser).length) {
    //set id and set _id as user
    studentData.id = newUser.id;
    studentData.user = newUser._id; //refarence _id

    const newStudent = await Student.create(studentData);
    return newStudent;
  }

  //create instanse methode
  // const student = new Student(studentData);
  // if (await student.isUserExist(studentData.id)) {
  //   throw new Error('User alreaday exists');
  // }
  //const result = await student.save(); //build in instance methode ist's provide on mongoose
  // return result;
};

export const userService = {
  createStudentIntoDB,
};
