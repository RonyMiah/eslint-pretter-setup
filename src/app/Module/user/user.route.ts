import express from 'express';
import { userController } from './user.controller';

import validateRequest from '../../middlwares/validateRequest';
import { createStudentValidationSchema } from '../student/student.validate';
import { AdminValidation } from '../Admin/admin.validation';
import { facultyValidation } from '../Faculty/faculty.validation';

const router = express.Router();

router.post(
  '/create-student',
  validateRequest(createStudentValidationSchema),
  userController.createStudent,
);

router.post(
  '/create-faculty',
  validateRequest(facultyValidation.createFacultyValidationSchema),
  userController.createFaculty,
);

router.post(
  '/create-admin',
  validateRequest(AdminValidation.createAdminValidationSchema),
  userController.createAdmin,
);

export const UserRoute = router;
