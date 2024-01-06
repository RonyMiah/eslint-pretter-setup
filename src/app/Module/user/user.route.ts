import express from 'express';
import { userController } from './user.controller';

import validateRequest from '../../middlwares/validateRequest';
import { createStudentValidationSchema } from '../student/student.validate';
import { AdminValidation } from '../Admin/admin.validation';
import { facultyValidation } from '../Faculty/faculty.validation';
import auth from '../../middlwares/auth';
import { USER_ROLE } from './user.constant';


const router = express.Router();

router.post(
  '/create-student',
  auth(USER_ROLE.admin),
  validateRequest(createStudentValidationSchema),
  userController.createStudent,
);

router.post(
  '/create-faculty',
  // auth(USER_ROLE.admin),
  validateRequest(facultyValidation.createFacultyValidationSchema),
  userController.createFaculty,
);

router.post(
  '/create-admin',
  // auth(USER_ROLE.admin),
  validateRequest(AdminValidation.createAdminValidationSchema),
  userController.createAdmin,
);



export const UserRoute = router;
