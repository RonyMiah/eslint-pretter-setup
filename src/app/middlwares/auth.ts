import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../error/AppError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../Module/user/user.interface';
import { User } from '../Module/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    //check user given or not token
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    //check user send verify token or wrong token

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    //check role admin or student or faculty
    const { role, userId, iat } = decoded;

    //here iat is number this iat given by token

    const user = await User.isUserExists(userId);

    if (!user) {
      //checking user is exist or not
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }

    //checking if the user is already deleted
    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'This user is is alreqady Deleted',
      );
    }

    //checking if the user is blocked
    const isBlocked = user?.status;
    if (isBlocked === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is Blocked ');
    }

    //now compaire iat and passwordChangeAt ,,, check iat before password change or not
    //when password willbe change then addedd passwordChangeAt

    if (
      user.passwordChangeAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangeAt,
        iat as number,
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not Authotized ! ');
    }

    //check required Roles for perametter value
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not Authorized user',
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
