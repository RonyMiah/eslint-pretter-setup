import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const statusCode = 400;
  // error parturn is    error : issues: [{code: "some", exprcted: "string", recevied: 'Undefined', path: ["body", "name or age or nasted object error"]},{code: "some", exprcted: "string", recevied: 'Undefined', path: ["body", "fullname or age or nasted object error"]}]
  //zod error last index aa details full error dey that's why we chose last index
  const errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode,
    message: ' Validation Error',
    errorSources,
  };
};

export default handleZodError;
