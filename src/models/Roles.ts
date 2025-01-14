import mongoose from 'mongoose';

interface ISubmodule {
  key: string;
  displayName: string;
  permission: object;
}

interface IPermission {
  key: string;
  displayName: string;
  submodules: ISubmodule[];
}

interface IMenu {
  menuId: string; // Unique identifier for the menu
  menuName: string; // Display name of the menu
}

interface IRole {
  roleName: string;
  roleId: number;
  permissions: IPermission[];
  menus: IMenu[]; // Added menus property
  createdBy: mongoose.Types.ObjectId; // Correctly using ObjectId type
  updatedBy: mongoose.Types.ObjectId; // Correctly using ObjectId type
  status: string; // You can also use a specific enum type for better validation
}

const submoduleSchema = new mongoose.Schema<ISubmodule>({
  key: { type: String, required: true },
  displayName: { type: String, required: true },
  permission: { type: Object, required: true }
});

const permissionSchema = new mongoose.Schema<IPermission>({
  key: { type: String, required: true },
  displayName: { type: String, required: true },
  submodules: { type: [submoduleSchema], required: true }
});

const menuSchema = new mongoose.Schema<IMenu>({
  menuId: { type: String, required: true },
  menuName: { type: String, required: true }
});

const rolesSchema = new mongoose.Schema<IRole>({
  roleName: { type: String, required: true },
  roleId: { type: Number, required: true, unique: true },
  permissions: { type: [permissionSchema], required: true },
  menus: { type: [menuSchema], required: true }, // Added menus field
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // Changed to ObjectId
  updatedBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // Changed to ObjectId
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], required: true, default: 'ACTIVE' }
}, { timestamps: true });

const RolesModel = mongoose.model<IRole>('Roles', rolesSchema);

// Use default export
export default RolesModel;
export type { IRole, IMenu }; // Export IRole and IMenu as named exports
