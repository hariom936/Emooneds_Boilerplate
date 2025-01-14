import mongoose, { ObjectId } from 'mongoose';

// Define the Menu interface
interface IMenu {
  menuId: string; // Unique identifier for the menu number
  menuName: string; // Display name of the menu
  createdBy: ObjectId;
  updatedBy: ObjectId;
  status: string; // You can use enums if there are specific status values like ACTIVE, INACTIVE
}

// Define the Menu schema
const menuSchema = new mongoose.Schema<IMenu>({
  menuId: {
    type: String,
    required: true,
    unique: true
  },
  menuName: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles', // Assuming you have a Users collection
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles',
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'ACTIVE'
  }
}, { timestamps: true });

const MenuModel = mongoose.model<IMenu>('Menu', menuSchema);

export { IMenu, MenuModel };
