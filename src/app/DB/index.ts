import { USER_ROLE } from '../Module/user/user.constant';
import { User } from '../Module/user/user.model';
import config from '../config';

const supperUser = {
  id: '001',
  email: 'superadmind@gmail.com',
  password: config.super_admin_password,
  needsPasswordChange: false,
  role: USER_ROLE.superAdmin,
  status: 'in-progress',
  isDeleted: false,
};

const seedSupperAdmin = async () => {
  //when database is connected , we will check is there any user who is supper Admin

  //Find Supper Admin is exists or not in User Database
  const isSupperAdminExists = await User.findOne({
    role: USER_ROLE.superAdmin,
  });
  if (!isSupperAdminExists) {
    await User.create(supperUser);
  }
};

//Now we will added server.ts file where DB Conected .
export default seedSupperAdmin;
