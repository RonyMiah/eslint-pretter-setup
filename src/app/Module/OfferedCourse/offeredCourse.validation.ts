import { z } from 'zod';
import { Days } from './offeredCourse.constant';

const timeStringSchema = z.string().refine(
  (time) => {
    // const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; //00-09 10-19 20-23
    return regex.test(time);
  },
  {
    message: 'Invalid Type Formate Expected HH: MM in 24 hours format',
  },
);

const createOfferedCourseValidationSchema = z.object({
  body: z
    .object({
      semesterRegistration: z.string(),
      // academicSemester: z.string(), // eita amer font end theke asbe na eita backend aa hanlde korbo
      academicFaculty: z.string(),
      academicDepartment: z.string(),
      course: z.string(),
      faculty: z.string(),
      maxCapacity: z.number(),
      section: z.number(),
      days: z.array(z.enum([...Days] as [string, ...string[]])),
      startTime: timeStringSchema,
      endTime: timeStringSchema,
    })
    .refine(
      (body) => {
        //startTime : 10:30 => 1970-01-01T10:30
        //endTime: 12:30   => 1970-01-01T12:30

        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);

        return end > start;
      },
      {
        message: 'Start time should be before end time ',
      },
    ), //body te refine chalanor karon holo body er bitore startTime and endTime ase ei 2 ta compair korte hobe je end time er cheye start time choto
});
const updateOfferedCourseValidationSchema = z.object({
  body: z
    .object({
      //only 5 item willbe change not all item
      faculty: z.string(),
      maxCapacity: z.number(),
      days: z.array(z.enum([...Days] as [string, ...string[]])),
      startTime: timeStringSchema,
      endTime: timeStringSchema,
    })
    .refine(
      (body) => {
        //startTime : 10:30 => 1970-01-01T10:30
        //endTime: 12:30   => 1970-01-01T12:30

        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);

        return end > start;
      },
      {
        message: 'Start time should be before end time ',
      },
    ), //body te refine chalanor karon holo body er bitore startTime and endTime ase ei 2 ta compair korte hobe je end time er cheye start time choto
});

export const offeredCourseValidation = {
  createOfferedCourseValidationSchema,
  updateOfferedCourseValidationSchema,
};
