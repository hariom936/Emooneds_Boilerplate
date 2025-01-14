import seederConstants from '../src/constants/seederConstants'; // Import seeder constants
import RolesModel from '../src/models/Roles'; // Import the Roles model
import { dbStatus } from '../src/types/customDatabaseTypes'; // Import enums for status

// Data to seed the roles
const data = [
  {
    _id: "653a3a42d3f6eaf4a9c88f17",
    roleName: "Hospital_Super_Admin",
    roleId: 1,
    permissions: [
      {
        key: "admin_module",
        displayName: "Blitz Module",
        submodules: [
          {
            key: "user_management",
            displayName: "Role and User Management",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          },
          {
            key: "hospital_management",
            displayName: "Hospital Operations",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          }
        ]
      }
    ],
    menus: [
      {
        menuId: "menu_1",
        menuName: "Super Admin Dashboard"
      },
      {
        menuId: "menu_2",
        menuName: "User Management"
      }
    ],
    createdBy: seederConstants.user.appUserId, // Make sure this references a valid ObjectId or a real user ID
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    _id: "653a3a42d3f6eaf4a9c88f18",
    roleName: "Administrator",
    roleId: 2,
    permissions: [
      {
        key: "admin_module",
        displayName: "Administration Module",
        submodules: [
          {
            key: "hospital_management",
            displayName: "Manage Hospital",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          },
          {
            key: "report_generation",
            displayName: "Generate Reports",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: false
            }
          }
        ]
      }
    ],
    menus: [
      {
        menuId: "menu_3",
        menuName: "Admin Dashboard"
      },
      {
        menuId: "menu_4",
        menuName: "Report Management"
      }
    ],
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    _id: "653a3a42d3f6eaf4a9c88f19",
    roleName: "Doctor",
    roleId: 3,
    permissions: [
      {
        key: "patient_management",
        displayName: "Patient Module",
        submodules: [
          {
            key: "patient_records",
            displayName: "Access Patient Records",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          },
          {
            key: "prescriptions",
            displayName: "Manage Prescriptions",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          }
        ]
      }
    ],
    menus: [
      {
        menuId: "menu_5",
        menuName: "Doctor Dashboard"
      },
      {
        menuId: "menu_6",
        menuName: "Patient Management"
      }
    ],
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    _id: "653a3a42d3f6eaf4a9c88f20",
    roleName: "Nurse",
    roleId: 4,
    permissions: [
      {
        key: "patient_care",
        displayName: "Nursing Module",
        submodules: [
          {
            key: "patient_records",
            displayName: "View Patient Records",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: false
            }
          },
          {
            key: "vital_signs",
            displayName: "Manage Vital Signs",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          }
        ]
      }
    ],
    menus: [
      {
        menuId: "menu_7",
        menuName: "Nurse Dashboard"
      },
      {
        menuId: "menu_8",
        menuName: "Vital Signs"
      }
    ],
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    _id: "653a3a42d3f6eaf4a9c88f21",
    roleName: "Receptionist",
    roleId: 5,
    permissions: [
      {
        key: "appointment_management",
        displayName: "Reception Module",
        submodules: [
          {
            key: "scheduling",
            displayName: "Schedule Appointments",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          },
          {
            key: "patient_intake",
            displayName: "Handle Patient Intake",
            permission: {
              canAccess: true,
              canRead: true,
              canWrite: true
            }
          }
        ]
      }
    ],
    menus: [
      {
        menuId: "menu_9",
        menuName: "Receptionist Dashboard"
      },
      {
        menuId: "menu_10",
        menuName: "Appointment Management"
      }
    ],
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  }
];

// Seed the roles data
const up = async () => {
  try {
    await RolesModel.insertMany(data);
  } catch (error) {
    console.error('Error inserting roles:', error);
  }
};

// Remove the roles data
const down = async () => {
  try {
    await RolesModel.deleteMany({});
  } catch (error) {
    console.error('Error deleting roles:', error);
  }
};

// Export the up and down functions for seeding
module.exports = {
  up,
  down
};
