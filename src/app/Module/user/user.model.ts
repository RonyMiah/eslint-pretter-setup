import { Schema, model } from 'mongoose';
import { TUser, UsertModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { USER_STATUS } from './user.constant';

const userSchema = new Schema<TUser, UsertModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangeAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: {
        values: ['superAdmin', 'admin', 'student', 'faculty'],
        message: `{VALUE} is not valid`,
      },
    },
    status: {
      type: String,
      enum: {
        values: USER_STATUS,
        message: `{VALUE} is not valid`,
      },
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

//Hash Password
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_solt_round), // bcrypt solt bydefult string that's why we added Number function // provide number
  );
  next();
});

//Response Password Empty
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

//Static Methode
userSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await User.findOne({ id }).select('+password'); //pass + other data
  return existingUser;
};

//Compair Password 
userSchema.statics.isPasswordMatch = async function (
  plaintextPassword,
  hasedPassword,
) {
  return await bcrypt.compare(plaintextPassword, hasedPassword);
};

//Check User is Already Blocked ?
userSchema.statics.isBlockedUser = async function (user) {
  const blockuser = (await user.status) === 'blocked';
  return blockuser;
};

//Check user is Already delete ?
userSchema.statics.isDeleted = async function (user) {
  const deletedUser = (await user.isDeleted) === true;
  return deletedUser;
};

//IF async function not need into function do not use it , other wise wrong info goted ..
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangeTimeStamp: Date,
  jwtIssouedTimestamp: number,
) {
  // convart Date to number Formate Like this => 1704560502
  //2024-01-06T17:12:54.497Z  ==>  1704560502
  const passwordChangedTime =
    new Date(passwordChangeTimeStamp).getTime() / 1000;
  return passwordChangedTime > jwtIssouedTimestamp;
};

export const User = model<TUser, UsertModel>('User', userSchema);
