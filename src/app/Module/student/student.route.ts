import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlwares/validateRequest';
import { studentValidations } from './student.validate';

const router = express.Router();

//will call controler function

// router.post('/create-student', StudentControllers.createStudent);
router.get('/', StudentControllers.getAllStudent);
router.get('/:id', StudentControllers.getAStudent);
router.patch(
  '/:id',
  validateRequest(studentValidations.updateStudentValidationSchema),
  StudentControllers.updateStudent,
);
router.delete('/:id', StudentControllers.deleteStudent);

export const StudentRoutes = router;
