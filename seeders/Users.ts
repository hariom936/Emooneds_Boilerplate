import seederConstants from '../src/constants/seederConstants';
import { UserModel as User } from '../src/models/Users';
import { dbStatus } from '../src/types/customDatabaseTypes';

const data = [
  {
    userId:1,
    userEmail: 'hariom.verma@kellton.com',
    firstName: 'Hariom',
    lastName: 'Verma',
    userName: 'Hariom Verma',
    role:{
      roleId: 1,
      roleName: 'SuperAdmin'
    },
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    lastLoginTime: new Date(),
    status: dbStatus.ACTIVE
  }
];

const up = async () => {
  await User.insertMany(data);
};

const down = async () => {
  await User.deleteMany({});
};

module.exports = {
  up,
  down
};
