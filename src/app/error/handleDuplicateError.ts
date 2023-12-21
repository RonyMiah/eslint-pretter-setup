/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

// jodi amra isUser Exist pre middle ware diye check na kori tahole mongoose er unic validate kore tacknicaly unic not a validator er jonno amader duplicate error handle korte hobe

//error pattrn >> error: { "index" : 0, "code": 11000, "keyPattern": {name: 1}, keyvalue: {name: "Department of ........"}}

//message er modde >> "E11000 duplicate key error collection : fast-project ..... index : name_1 dup key: { name: \"Department of computer .... \"}"
//now message ke rejex use kore filter korte hobe

const handleDuplicateError = (error: any): TGenericErrorResponse => {
  const match = error.message.match(/"(.*?)"/);
  const extedMessage = match && match[1];// match er 1 number index
  const errorSources: TErrorSources = [
    {
      path: ' ',
      message: ` ${extedMessage} is Already Exist`,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: ' Duplicate Error ',
    errorSources,
  };
};

export default handleDuplicateError;
