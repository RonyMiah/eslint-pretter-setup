import express from 'express';
import { OfferedCourseControllers } from './offeredCourse.controller';
import validateRequest from '../../middlwares/validateRequest';
import { offeredCourseValidation } from './offeredCourse.validation';

const router = express.Router();

router.post(
  '/create-offered-course',
  validateRequest(offeredCourseValidation.createOfferedCourseValidationSchema),
  OfferedCourseControllers.createOfferedCourse,
);
router.get('/:id', OfferedCourseControllers.getSingleOfferedCourse);
router.patch(
  '/:id',
  validateRequest(offeredCourseValidation.updateOfferedCourseValidationSchema),
  OfferedCourseControllers.updateOfferedCourse,
);
router.get('/', OfferedCourseControllers.getAllOfferedCourse);

router.delete('/:id', OfferedCourseControllers.deleteOfferedCourse);

export const OfferedCourseRouters = router;
