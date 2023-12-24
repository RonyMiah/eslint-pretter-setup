import express from 'express';
import validateRequest from '../../middlwares/validateRequest';
import { SemesterRegistrationValidations } from './semesterRegistration.validation';
import { semesterRegistrationControllers } from './semesterRegistration.controller';

const router = express.Router();

router.post(
  '/create-semester-registration',
  validateRequest(
    SemesterRegistrationValidations.createSemesterRegistrationValidationSchema,
  ),
  semesterRegistrationControllers.createSemesterRegistration,
);

router.get(
  '/:id',
  semesterRegistrationControllers.getSingleSemesterRegistration,
);
router.patch(
  '/:id',
  validateRequest(
    SemesterRegistrationValidations.updateSemesterRegistrationValidationSchema,
  ),
  semesterRegistrationControllers.updateSemesterRegistration,
);
router.delete(
  '/:id',
  semesterRegistrationControllers.deleteSemesterRegistration,
);
router.get('/', semesterRegistrationControllers.getAllSemesterRegistration);

export const SemesterRegistrationRoutes = router;
