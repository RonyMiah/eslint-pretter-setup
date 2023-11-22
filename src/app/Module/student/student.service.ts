import { Student } from './student.interface';
import { StudentModel } from './student.model';

const createStudentIntoDB = async (student: Student) => {
  //database query choble  mongoose er model er opore
  const result = await StudentModel.create(student);
  // new data return
  // Mongoose Methode >> jeitate call kore dile data insert kore dibe/create kore dibe >>  Mongoose function use .
  return result;
};

const getAllStudentsFromDB = async () => {
  const result = await StudentModel.find();
  return result;
};
const getAStudentFromDB = async (id: string) => {
  const result = await StudentModel.findOne({ id });
  return result;
};

export const StudentServices = {
  createStudentIntoDB,
  getAllStudentsFromDB,
  getAStudentFromDB,
};
