/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import { StudentServices } from './student.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

//Controller handle Only(Aplication Logic) request and response data
//Client theke amra koyek vabe data get korte pari >> req.params >> res.query >> big data req.body and ei process ta database theke hobe jer jonno async function use korte hobe .

const getAllStudent: RequestHandler = catchAsync(async (req, res, next) => {
  const result = await StudentServices.getAllStudentsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Student get successfully ',
    data: result,
  });
});

const getAStudent: RequestHandler = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const result = await StudentServices.getAStudentFromDB(studentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single Student get successfully ',
    data: result,
  });
});

const deleteStudent: RequestHandler = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const result = await StudentServices.deleteStudentFromDB(studentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deleted Student successfully ',
    data: result,
  });
});

export const StudentControllers = {
  getAllStudent,
  getAStudent,
  deleteStudent,
};
