import express from 'express';
import validateRequest from '../../middlwares/validateRequest';
import { CourseValidations } from './course.validation';
import { CourseController } from './course.controller';

const router = express.Router();

router.post(
  '/create-course',
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseController.createCourse,
);
router.get('/', CourseController.getAllCourse);
router.get('/:id', CourseController.getSingleCourse);
router.patch(
  '/:id',
  validateRequest(CourseValidations.UpdateCreateCourseValidationSchema),
  CourseController.updateCourse,
);
router.put('/:courseId', CourseController.assignFacultiesWithCourse);
router.delete('/:id', CourseController.deleteCouse);

export const CourseRoutes = router;
