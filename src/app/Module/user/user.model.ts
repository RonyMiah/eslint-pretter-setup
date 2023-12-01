import { Schema, model } from 'mongoose';
import { TUser } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';

const userSchema = new Schema<TUser>(
  {
    id: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
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

export const User = model<TUser>('User', userSchema);
