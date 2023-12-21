import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';



//error pattan >> error: { "stringValue: "\"3dsafasdf\"", "valueType" : "string", kind: "ss" , value: "3dsafasdf", path: "_id" , name: "CastError" , message: "Cast to objectId failed for value \3dsafasdf\}

const handleCastError = (
  error: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const statusCode = 404;
  const errorSources: TErrorSources = [
    {
      path: error?.path,
      message: error?.message,
    },
  ];

  return {
    statusCode,
    message: 'Invalid Id ',
    errorSources,
  };
};

export default handleCastError;
