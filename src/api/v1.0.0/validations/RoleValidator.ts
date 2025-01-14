import {
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsString,
  MaxLength,
  IsIn,
  Matches,
  IsNumber,
  IsOptional,
  Min,
  IsMongoId
} from 'class-validator';
import { Type } from 'class-transformer';
import databaseConstants from '../../../constants/databaseConstants';
import validationConstants from '../../../constants/validationConstants';

export class UserId {
  @IsNotEmpty({ message: "user Id is required" })
  @IsNumber()
  @Min(1)
  userId: number;
}
class Submodule {
  @IsString({ message: 'Submodule key must be a string' })
  @IsNotEmpty({ message: 'Submodule key is required' })
  key: string;

  @IsString({ message: 'Display name must be a string' })
  @IsNotEmpty({ message: 'Display name is required' })
  displayName: string;

  @IsNotEmpty({ message: 'Permission object is required' })
  permission: {
    canAccess: boolean;
    canRead: boolean;
    canWrite: boolean;
  };
}

// Permissions Class
class Permissions {
  @IsString({ message: 'Key must be a string' })
  @IsNotEmpty({ message: 'Key is required' })
  key: string;

  @IsString({ message: 'Display name must be a string' })
  @IsNotEmpty({ message: 'Display name is required' })
  displayName: string;

  @IsArray({ message: 'Submodules must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Submodule)
  submodules: Submodule[];
}

// Menu Class
class Menu {
  @IsString({ message: 'Menu ID must be a string' })
  @IsNotEmpty({ message: 'Menu ID is required' })
  menuId: string;

  @IsString({ message: 'Menu name must be a string' })
  @IsNotEmpty({ message: 'Menu name is required' })
  menuName: string;
}

// CreateRole Class
export class CreateRole {
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  roleName: string;

  @IsNotEmpty({ message: 'Permissions are required' })
  @IsArray({ message: 'Permissions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Permissions) // Ensure Permissions class is properly defined
  permissions: Permissions[];

  @IsNotEmpty({ message: 'Menus are required' })
  @IsArray({ message: 'Menus must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Menu) // Ensure Menu class is properly defined
  menus: Menu[];

  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['ACTIVE', 'INACTIVE'], { message: 'Status must be either ACTIVE or INACTIVE' })
  status: string;
}



export class EditRole {
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsMongoId({
    message: validationConstants.IS_OBJECT_ID
  })
  roleId: string;

  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @Matches(/^[A-Za-z0-9\s]+$/, { message: validationConstants.ACCEPT_ONLY_CHARACTER })
  @MaxLength(100, {
    message: validationConstants.MAX_LENGTH
  })
  roleName: string;

  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsIn(databaseConstants.DB_STATUS, { message: validationConstants.IS_STATUS })
  status: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsArray({ message: validationConstants.IS_ARRAY })
  @ValidateNested({ each: true })
  @Type(() => Permissions)
  permissions: Permissions[];
}

export class EditRoleStatus {
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsMongoId({
    message: validationConstants.IS_OBJECT_ID
  })
  roleId: string;

  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsIn(databaseConstants.DB_STATUS, { message: validationConstants.IS_STATUS })
  status: string;
}


export class GetRolesQuery {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class GetRoleDetailsParams {
  @IsNotEmpty({
    message: validationConstants.REQUIRED
  })
  @IsMongoId({
    message: validationConstants.IS_OBJECT_ID
  })
  roleId: string;
}
