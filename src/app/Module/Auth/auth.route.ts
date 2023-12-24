import express from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlwares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.logedinUser,
);

export const AuthRoutes = router;
