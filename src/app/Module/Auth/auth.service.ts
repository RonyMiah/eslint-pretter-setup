import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';
import { createToken, verifyToken } from './auth.utils';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail';
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
  //compaire password bycript
  if (!(await User.isPasswordMatch(payload?.password, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match ');
  }

  //create a token and send to the client

  const jwtPayloadData = {
    userId: user?.id,
    role: user?.role,
  };
  //create accesss Token
  const accessToken = createToken(
    jwtPayloadData,
    config.jwt_access_secret as string,
    config.jwt_access_expire as string,
  );
  //create RefreshToken
  const refreshToken = createToken(
    jwtPayloadData,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expire as string,
  );

  return {
    accessToken,
    refreshToken,
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

const refreshToken = async (token: string) => {
  //check user send verify token or wrong token must check refresh secrect
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  //check role admin or student or faculty
  const { userId, iat } = decoded;

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
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangeAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not Authotized ! ');
  }

  //create a token and send to the client

  const jwtPayloadData = {
    userId: user?.id,
    role: user?.role,
  };
  //create accesss Token
  const accessToken = createToken(
    jwtPayloadData,
    config.jwt_access_secret as string,
    config.jwt_access_expire as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userId: string) => {
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
  //create a token and send to the client

  const jwtPayloadData = {
    userId: user?.id,
    role: user?.role,
  };
  //create accesss Token
  const resetToken = createToken(
    jwtPayloadData,
    config.jwt_access_secret as string,
    config.jwt_reset_expire as string,
  );

  const resetUILink = `${config.reset_password_ui_link}?id=${user.id}&token=${resetToken}`;
  sendEmail(user.email, resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  const user = await User.isUserExists(payload?.id);

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

  // const decoded = jwt.verify(
  //   token as string,
  //   config.jwt_access_secret as string,
  // ) as JwtPayload;

  const decoded = verifyToken(
    token as string,
    config.jwt_access_secret as string,
  );

  //check role admin or student or faculty
  const { userId, role } = decoded;

  //check if the user is currect or not
  if (payload.id !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not Authorized User !');
  }

  //hash new Password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_solt_round),
  );

  await User.findOneAndUpdate(
    {
      id: userId,
      role: role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
