import { z } from 'zod';

const createAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Academic Department Must Be string',
      required_error: 'Name is required !',
    }),
    academicFaculty: z.string({
      invalid_type_error: 'Academic Faculty Must Be string Id',
      required_error: 'Faculty is Required !',
    }),
  }),
});

const updateAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Academic Department Must Be string',
        required_error: 'Name is required !',
      })
      .optional(),
    academicFaculty: z
      .string({
        invalid_type_error: 'Academic Faculty Must Be string Id',
        required_error: 'Faculty is Required !',
      })
      .optional(),
  }),
});

export const AcademicDepartmentValidation = {
  createAcademicDepartmentValidationSchema,
  updateAcademicDepartmentValidationSchema,
};
