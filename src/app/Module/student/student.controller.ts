import { Request, Response } from 'express';
import { StudentServices } from './student.service';

//Controller handle Only(Aplication Logic) request and response data
//Client theke amra koyek vabe data get korte pari >> req.params >> res.query >> big data req.body.

//ei process ta database theke hobe jer jonno async function use korte hobe .

const createStudent = async (req: Request, res: Response) => {
  try {
    const { student: studentData } = req.body;
    //   will call service function to send this data
    const result = await StudentServices.createStudentIntoDB(studentData);
    // Bisness Logice knows service thats why we send data to service
    //send response
    res.status(200).json({
      success: true,
      message: 'Student is created successfully',
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllStudent = async (req: Request, res: Response) => {
  try {
    const result = await StudentServices.getAllStudentsFromDB();
    res.status(200).json({
      success: true,
      message: 'All Student get successfully ',
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAStudent = async (req: Request, res: Response) => {
  const { studentId } = req.body;
  const result = await StudentServices.getAStudentFromDB(studentId);
  res.status(200).json({
    success: true,
    message: ` Single Student Get Successfully `,
    data: result,
  });
};

export const StudentControllers = {
  createStudent,
  getAllStudent,
  getAStudent,
};
