import { Schema, model } from 'mongoose';
import { FacultyModel, TFaculty, TUserName } from './faculty.interface';
import { BloodGroup, Gender } from './faculty.constant';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'FristName is Required'],
    trim: true,
    maxlength: [20, 'Name can not be more than 20 charecter'],
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'LastName is Required'],
    trim: true,
    maxlength: [20, 'Name can not be more than 20 charecter'],
  },
});

const facultySchema = new Schema<TFaculty, FacultyModel>(
  {
    id: {
      type: String,
      required: [true, 'ID is Required'],
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    name: {
      type: userNameSchema,
      required: [true, 'Name is required'],
    },
    gender: {
      type: String,
      enum: {
        values: Gender,
        message: '{VALUE} is not valid Gender',
      },
      required: true,
    },
    dateOfBirth: { type: String },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required '],
    },
    emergencyContactNo: {
      type: String,
      required: [true, 'EmergencyContactNo is required '],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BloodGroup,
        message: '{VALUE} is not a valid bood Group',
      },
      required: true,
    },
    presentAddress: {
      type: String,
      required: [true, 'PresentAddress is required'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'PermanentAddress is required'],
    },
    profileImg: {
      type: String,
    },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

//genarate full name

facultySchema.virtual('fullName').get(function () {
  return (
    this?.name?.firstName +
    ' ' +
    this?.name?.middleName +
    ' ' +
    this?.name?.lastName
  );
});

//filter out deleted documents
//find
facultySchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
//findOne
facultySchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

//agregate
facultySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

//Check User already exist or not

facultySchema.statics.isUserExists = async function (id: string) {
  const existUser = await Faculty.findOne({ id });
  return existUser;
};

export const Faculty = model<TFaculty, FacultyModel>('Faculty', facultySchema);
