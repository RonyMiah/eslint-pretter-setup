/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const match = error.message.match(/"(.*?)"/);
  const extedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: ' ',
      message: ` ${extedMessage} is Already Exist`,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: ' Duplicate Error  ',
    errorSources,
  };
};

export default handleDuplicateError;
