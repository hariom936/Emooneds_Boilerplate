import seederConstants from '../src/constants/seederConstants'; // Import the seeder constants
import { dbStatus } from '../src/types/customDatabaseTypes'; // Import enums for status
import { MenuModel } from '../src/models/Menus'; // Import the MenuModel

// Seed data for the menus
const data = [
  {
    menuId: "menu_1",
    menuName: "Projects",
    createdBy: seederConstants.user.appUserId, // Ensure this is a valid ObjectId or real user ID
    updatedBy: seederConstants.user.appUserId, // Ensure this is a valid ObjectId or real user ID
    status: dbStatus.ACTIVE // Use the ACTIVE status from the dbStatus enum
  },
  {
    menuId: "menu_2",
    menuName: "Programs",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_3",
    menuName: "Admin Dashboard",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_4",
    menuName: "Report Management",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_5",
    menuName: "Doctor Dashboard",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_6",
    menuName: "Patient Management",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_7",
    menuName: "Nurse Dashboard",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_8",
    menuName: "Vital Signs",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_9",
    menuName: "Receptionist Dashboard",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  },
  {
    menuId: "menu_10",
    menuName: "Appointment Management",
    createdBy: seederConstants.user.appUserId,
    updatedBy: seederConstants.user.appUserId,
    status: dbStatus.ACTIVE
  }
];

// Function to seed the menu data
const up = async () => {
  try {
    await MenuModel.insertMany(data); // Insert multiple menu records
  } catch (error) {
    console.error('Error inserting menus:', error);
  }
};

// Function to remove the menu data
const down = async () => {
  try {
    await MenuModel.deleteMany({});
  } catch (error) {
    console.error('Error deleting menus:', error);
  }
};

// Export the up and down functions for database seeding
module.exports = {
  up,
  down
};
