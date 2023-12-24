import express from 'express';
import { StudentRoutes } from '../Module/student/student.route';
import { UserRoute } from '../Module/user/user.route';
import { AcademicSemesteRoutes } from '../Module/academicSemester/academicSemester.route';
import { AcademicFacultyRoutes } from '../Module/academicFaculty/academicFaculty.route';
import { AcademicDepartmentRoutes } from '../Module/academicDepartment/academicDepartment.route';
import { FacultyRoute } from '../Module/Faculty/faculty.route';
import { AdminRoutes } from '../Module/Admin/admin.route';
import { CourseRoutes } from '../Module/Course/course.route';
import { SemesterRegistrationRoutes } from '../Module/semesterRegistration/semesterRegistration.route';
import { OfferedCourseRouters } from '../Module/OfferedCourse/offeredCourse.route';
import { AuthRoutes } from '../Module/Auth/auth.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoute,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/faculties',
    route: FacultyRoute,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/courses',
    route: CourseRoutes,
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
  {
    path: '/semester-registration',
    route: SemesterRegistrationRoutes,
  },
  {
    path: '/offered-courses',
    route: OfferedCourseRouters,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => {
  return router.use(route.path, route.route);
});

export default router;
