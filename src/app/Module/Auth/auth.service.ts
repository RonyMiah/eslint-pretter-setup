import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';

const loginUser = async (payload: TLoginUser) => {
  //check if the user is exists or not
  // const isUserExists = await User.findOne({ id: payload?.id });

  const user = await User.isUserExists(payload?.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  //check if the user isDeleted fields is already deleted or not
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This User is already deleted');
  }
  // check if the user status is 'blocked' or not
  const isBlocked = user?.status;
  if (isBlocked === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is already blocked');
  }
  //Static Methode use case

  // if (await User.isDeleted(user)) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'This User is already deleted');
  // }
  // //check user is blocked or not
  // if (await User.isBlockedUser(user)) {
  //   throw new AppError(httpStatus.FORBIDDEN, 'This user is already blocked');
  // }

  //compaire password bycript
  if (!(await User.isPasswordMatch(payload?.password, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match ');
  }

  //create a token and send to the client

  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return {
    accessToken,
    needPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  //checking user is exist or not

  const user = await User.isUserExists(userData?.userId);

  if (!user) {
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

  //check if the password is currrent or not
  //if password is not match throw Error
  //remember oldPassword is given plaintext send the user or postman
  //and hashed password is already exist in user.password
  if (!(await User.isPasswordMatch(payload.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match ');
  }

  // Hashed New Password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_solt_round),
  );

  //updated password and needsPasswordChange updated and passwordChangeAt Change

  await User.findOneAndUpdate(
    { id: userData.userId, role: userData.role },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );
  return null;
};

export const AuthServices = {
  loginUser,
  changePassword,
};
