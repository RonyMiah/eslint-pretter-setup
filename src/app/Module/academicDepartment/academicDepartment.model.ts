import { Schema, model } from 'mongoose';
import { TAcademicDepartment } from './academicDepartment.interface';
import AppError from '../../error/AppError';

const AcademicDepartmentSchema = new Schema<TAcademicDepartment>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  academicFaculty: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'AcademicFaculty',
  },
});

AcademicDepartmentSchema.pre('save', async function (next) {
  const isDepartMentExist = await AcademicDepartment.findOne({
    name: this.name,
  });
  if (isDepartMentExist) {
    throw new AppError(400, 'This Department is already exists ');
  }

  next();
});

AcademicDepartmentSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  //   console.log(query);
  const isUserExists = await AcademicDepartment.findOne(query);
  if (!isUserExists) {
    throw new AppError(404, "This Department doesn't exists Database");
  }
  next();
});

export const AcademicDepartment = model<TAcademicDepartment>(
  'AcademicDepartment',
  AcademicDepartmentSchema,
);
