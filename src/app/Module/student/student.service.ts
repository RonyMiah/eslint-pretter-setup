import { Student } from './student.model';

const getAllStudentsFromDB = async () => {
  const result = await Student.find();
  return result;
};

const getAStudentFromDB = async (id: string) => {
  // const result = await Student.findOne({ id });

  //using aggregate
  const result = await Student.aggregate([
    //stage -1
    { $match: { id: id } },
  ]);
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const result = await Student.updateOne({ id }, { isDeleted: true });
  return result;
};

export const StudentServices = {
  getAllStudentsFromDB,
  getAStudentFromDB,
  deleteStudentFromDB,
};
