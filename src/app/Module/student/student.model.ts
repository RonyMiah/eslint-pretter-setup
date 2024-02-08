import { Schema, model } from 'mongoose';
import {
  TStudent,
  TLocalGuardian,
  StudentModel,
  TGuardian,
  TUserName,
} from './student.interface';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
    trim: true,
    maxlength: [20, 'Name can not be more than 20 characters'],
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last Name is required'],
    maxlength: [20, 'Name can not be more than 20 characters'],
  },
});

const guardianSchema = new Schema<TGuardian>({
  fatherName: {
    type: String,
    trim: true,
    required: [true, 'Father Name is required'],
  },
  fatherOccupation: {
    type: String,
    trim: true,
    required: [true, 'Father occupation is required'],
  },
  fatherContactNo: {
    type: String,
    required: [true, 'Father Contact No is required'],
  },
  motherName: {
    type: String,
    required: [true, 'Mother Name is required'],
  },
  motherOccupation: {
    type: String,
    required: [true, 'Mother occupation is required'],
  },
  motherContactNo: {
    type: String,
    required: [true, 'Mother Contact No is required'],
  },
});

const localGuradianSchema = new Schema<TLocalGuardian>({
  name: {
    type: String,
    required: [true, ' Name is required'],
  },
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
});

const studentSchema = new Schema<TStudent, StudentModel>(
  {
    id: { type: String, required: [true, 'Id is required '], unique: true },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User', // it's Model User
    },
    name: {
      type: userNameSchema,
      required: [true, 'Name is required '],
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'femaile', 'other'],
        message: '{VALUE} is not valid gender',
      },
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: String,
    },
    email: { type: String, required: [true, 'email is required '] },
    contactNo: { type: String, required: [true, 'Contact No is required '] },
    emergencyContactNo: {
      type: String,
      required: [true, 'Emergency contact number is required '],
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE}  is not valid blood group',
      },
    },
    permanentAddress: {
      type: String,
      required: [true, ' PermanentAddress is required '],
    },
    guardian: {
      type: guardianSchema,
      required: [true, 'Guardian information is required '],
    },
    localGuardian: {
      type: localGuradianSchema,
      required: [true, 'Guardian information is required'],
    },
    profileImg: { type: String, default: '' },
    admissionSemester: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSemester',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicDepartment',
      required: true,
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicFaculty',
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

//static methode create
//Query Middleware
studentSchema.pre('find', function (next) {
  //find data >> isDeleted  false
  this.find({ isDeleted: { $ne: true } });
  next();
});

studentSchema.pre('findOne', function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

//Aggregate Middleware
studentSchema.pre('aggregate', function (next) {
  //  console.log(this.pipeline()); //[ { '$match': { id: '2345' } } ]

  //amader $metch er age arekta $metch add korte hobe jate kore amra filter korte pari such as [ {$match : {idDeleted: {$ne: true}}} ,{ '$match': { id: '2345' } }]

  //er jonno amader unshift use korte hobe
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

//virtuals
studentSchema.virtual('fullname').get(function () {
  //remember it bydefult virtual is not-active or on >> we can trun on virtual  >> on korer jonno amra schema er modde }braket er pore , {toJSON :{virtuals: true}}
  return `${this?.name?.firstName} ${this?.name?.middleName} ${this?.name?.lastName}  `;
});

studentSchema.statics.isUserExists = async (id: string) => {
  const existingUser = Student.findOne({ id });
  return existingUser;
};

//instance methode create for using instance
studentSchema.methods.isUserExist = async (id: string) => {
  const existingUser = await Student.findOne({ id });
  return existingUser;
};

export const Student = model<TStudent, StudentModel>('Student', studentSchema);
