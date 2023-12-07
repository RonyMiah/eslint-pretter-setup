import express from 'express';
import { StudentRoutes } from '../Module/student/student.route';
import { UserRoute } from '../Module/user/user.route';
import { AcademicSemesteRoutes } from '../Module/academicSemester/academicSemester.route';
import { AcademicFacultyRoutes } from '../Module/academicFaculty/academicFaculty.route';
import { AcademicDepartmentRoutes } from '../Module/academicDepartment/academicDepartment.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/users',
    route: UserRoute,
  },
  {
    path: '/academic-semesters',
    route: AcademicSemesteRoutes,
  },
  {
    path: '/academic-faculties',
    route: AcademicFacultyRoutes,
  },
  {
    path: '/academic-department',
    route: AcademicDepartmentRoutes,
  },
];

moduleRoutes.forEach((route) => {
  return router.use(route.path, route.route);
});

export default router;
