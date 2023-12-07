import express from 'express';
import { userController } from './user.controller';

import validateRequest from '../../middlwares/validateRequest';
import { createStudentValidationSchema } from '../student/student.validate';

const router = express.Router();

router.post(
  '/create-student',
  validateRequest(createStudentValidationSchema),
  userController.createStudent,
);

export const UserRoute = router;
