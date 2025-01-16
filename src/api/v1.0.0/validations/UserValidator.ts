import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsString,
  IsIn,
  IsMongoId
} from 'class-validator';
import validationConstants from '../../../constants/validationConstants';
import databaseConstants from '../../../constants/databaseConstants';


// export class TypesUser{
//   @IsNotEmpty({ message: validationConstants.REQUIRED })
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   type: string;
// }
export class LoginUser {
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsEmail({}, { message: validationConstants.INVALID_VALUE })
  userEmail: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userName: string;
}

export class CreateUser {

  @IsOptional({ message: validationConstants.REQUIRED })
  @IsNumber({}, { message: validationConstants.INVALID_VALUE }) // Validate as a number
  userId: number; // Add this line

  @IsOptional({ message: validationConstants.REQUIRED })
  @IsNumber({}, { message: validationConstants.INVALID_VALUE }) // Validate as a number
  roleId: number; // Add this line


  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @MaxLength(100, { message: 'First name is maximum $constraint1 characters' })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  firstName: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @MaxLength(100, { message: 'Username is maximum $constraint1 characters' })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userName: string;

  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  lastName?: string; // Make optional

  @IsEmail({}, { message: validationConstants.INVALID_VALUE })
  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userEmail: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsIn(databaseConstants.CREATE_USER_VALID_STATUS, { message: validationConstants.INVALID_VALUE })
  status: boolean;

  
}

export class EditUser {

  @IsNotEmpty({ message: validationConstants.INVALID_VALUE })
  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  firstName: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userName: string;

  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  lastName: string;

  @IsEmail({}, { message: validationConstants.INVALID_VALUE })
  @MaxLength(100, { message: validationConstants.MAX_LENGTH })
  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userEmail: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsIn(databaseConstants.CREATE_USER_VALID_STATUS, { message: validationConstants.INVALID_VALUE })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  status: string;
}

export class UserListing {

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number;

  @IsNotEmpty({
    message: 'Page is Required'
  })
  @IsNumber()
  @Min(1)
  page: number;
}

export class DisableUser {
  @IsMongoId({ message: validationConstants.IS_OBJECT_ID })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  userId: string;

  @IsNotEmpty({ message: validationConstants.REQUIRED })
  @IsString({ message: validationConstants.IS_STRING_TYPE })
  @IsIn(databaseConstants.DB_STATUS, { message: validationConstants.INVALID_VALUE })
  userStatus: string;
}

export class UserId {
  @IsNotEmpty({ message: "user Id is required" })
  @IsNumber()
  @Min(1)
  userId: number;
}
