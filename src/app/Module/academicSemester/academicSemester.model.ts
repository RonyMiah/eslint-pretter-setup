import { Schema, model } from 'mongoose';
import { TAcademicSemester } from './academicsemester.interface';
import {
  AcademicSemesterCode,
  AcademicSemesterName,
  Month,
} from './academicSemester.constant';

const academicSemesterSchema = new Schema<TAcademicSemester>(
  {
    name: {
      type: String,
      enum: AcademicSemesterName,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      enum: AcademicSemesterCode,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    startMonth: {
      type: String,
      enum: Month,
      required: true,
    },
    endMonth: {
      type: String,
      enum: Month,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//pre middleware check
//schema er opore middle ware cholbe
// academicSemesterSchema.pre('save', async function (next) {
//   //same name same year user exist kore kina such as >> 2030 .. "Authum" is Exist?
//   const isSemesterExists = await AcademicSemester.findOne({
//     name: this.name,
//     year: this.year,
//   });

//   if (isSemesterExists) {
//     throw new Error('Semester already exists');
//   }
//   next();
// });

export const AcademicSemester = model<TAcademicSemester>(
  'AcademicSemester',
  academicSemesterSchema,
);

//requirment

//if 2030 te Autum >>> created thake tahole next time create hobe na
//if 2031 te Fall Created thake tahole next time create hobe na .
//make sure Authum - 01, Summar - 02 and Fall - 03
