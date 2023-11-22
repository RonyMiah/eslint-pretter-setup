import express from 'express';
import { StudentControllers } from './student.controller';

const router = express.Router();

//will call controler function

router.post('/create-student', StudentControllers.createStudent);
router.get('/', StudentControllers.getAllStudent);
router.get('/:studentId', StudentControllers.getAStudent);

export const StudentRoutes = router;
