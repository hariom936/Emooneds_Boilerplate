// aggregator.ts (or wherever you're combining exports)
export { IUser, UserModel as Users } from './Users';
export { IRole } from './Roles'; // Only export the named type
export { default as Roles } from './Roles'; // Use default export for RolesModel
