import { Schema, model } from 'mongoose';
import { TUser, UsertModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';

const userSchema = new Schema<TUser, UsertModel>(
  {
    id: {
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
        values: ['admin', 'student', 'faculty'],
        message: `{VALUE} is not valid`,
      },
    },
    status: {
      type: String,
      enum: {
        values: ['in-progress', 'blocked'],
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

//password before save database hash it
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_solt_round), // bcrypt solt bydefult string that's why we added Number function // provide number
  );
  next();
});

//when response send the response is empty password how to do this let me show
userSchema.post('save', function (doc, next) {
  //now doc is updated document
  //after the save document in mongodb and send response empty password
  doc.password = '';
  next();
});

//instance methode create for using instance

userSchema.statics.isUserExists = async function (id: string) {
  const existingUser = await User.findOne({ id }).select('+password'); // show er jonno +passworduse kora hoise + na dile only password dibe
  return existingUser;
};

userSchema.statics.isPasswordMatch = async function (
  plaintextPassword,
  hasedPassword,
) {
  return await bcrypt.compare(plaintextPassword, hasedPassword);
};

userSchema.statics.isBlockedUser = async function (user) {
  const blockuser = (await user.status) === 'blocked';
  return blockuser;
};

userSchema.statics.isDeleted = async function (user) {
  const deletedUser = (await user.isDeleted) === true;
  return deletedUser;
};

//async function jodi na lage tahole use kora jabe na use korle wrong info dibe
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangeTimeStamp: Date,
  jwtIssouedTimestamp: number,
) {
  // convart date to number formate
  //2024-01-06T17:12:54.497Z  ,  1704560502
  const passwordChangedTime =
    new Date(passwordChangeTimeStamp).getTime() / 1000;
  //1704561174.497 ,  1704560502
  return passwordChangedTime > jwtIssouedTimestamp;
};

export const User = model<TUser, UsertModel>('User', userSchema);

