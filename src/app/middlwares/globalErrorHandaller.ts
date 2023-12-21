/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { TErrorSources } from '../interface/error';
import config from '../config';
import handleZodError from '../error/handleZodError';
import handleValidationError from '../error/handleValidationError';
import handleCastError from '../error/handleCastError';
import handleDuplicateError from '../error/handleDuplicateError';
import AppError from '../error/AppError';

//error handaller must need 4 parametter
const globalErrorHandaller: ErrorRequestHandler = (error, req, res, next) => {
  //setting default value
  let statusCode = 500;
  let message = 'Something went to wrong';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: '',
    },
  ];

  //zod error validation
  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  //Mongoose Validation Error difrent pattan
  else if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  //Cast Error (when get single value form db id is wrong )
  else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  //Cast Duplicate Error >> 11000 >> mongoose unick handle kore eita
  else if (error?.code === 11000) {
    const simplifiedError = handleDuplicateError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  //AppError
  else if (error instanceof AppError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorSources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  }

  //Error Global Error
  else if (error instanceof Error) {
    message = error?.message;
    errorSources = [
      {
        path: '',
        message: error?.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    stack: config.NODE_ENV === 'development' ? error?.stack : null,
    error,
  });
};

export default globalErrorHandaller;

/*
success
message
errorSources: [
  path: "",
  message: "",
]
stack
*/
