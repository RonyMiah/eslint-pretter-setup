import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

// const validateRequest = (schema: AnyZodObject) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       //zod check validation
//       // if everything ok call next
//       await schema.parseAsync({
//         body: req.body,
//       });
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({ body: req.body });
    next();
  });
};

export default validateRequest;
