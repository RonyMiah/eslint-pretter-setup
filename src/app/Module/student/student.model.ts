import { Schema, model } from 'mongoose';
import { Student, LocalGuardian } from './student.interface';

const localGuardianSchema = new Schema<LocalGuardian>({
  name: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const studentSchema = new Schema<Student>({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  gender: ['maile', 'femaile'],
  localGuardian: localGuardianSchema,
  bladGroup: ['A+', 'B+', 'AB+', 'O+'],
  isActive: ['active', 'inactive'],
});

//1st perametter er name ta database ee as a collection hisabe save hobe .

export const StudentModel = model<Student>('Student', studentSchema);
