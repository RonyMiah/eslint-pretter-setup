import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

//Mongoose Unic error mongoose validation error

// error pattan  >> error:{ errors: {name: {name: 'ValidationError', message: "Path name is required", properties: {message: "path name is required"}, kind: "requied", path: 'name}, "_message: "validate failed", "name" : "error name" , "message" : "details message "}}

//jeheto error pattan object hisabe astase er jonno object ke array te convart korbo then array te loop korbo like map or forEatch 

const handleValidationError = (
  error: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(error.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleValidationError;
