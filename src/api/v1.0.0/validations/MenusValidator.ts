// import {
//   IsOptional,
//   IsNumber,
//   IsIn,
//   Min,
//   IsNotEmpty,
//   IsMongoId,
//   IsString,
//   MaxLength
// } from 'class-validator';
// import validationConstants from '../../../constants/validationConstants';
// import databaseConstants from '../../../constants/databaseConstants';
// export class getListToolTips {
  
//   @IsOptional()
//   @IsIn(validationConstants.VALIDATE_TOOLTIPS.TOOLTIPS_LISTING_FILTERS, {
//     message: 'Filter must be of the following values: $constraint1'
//   })
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   filterBy: string;

//   @IsOptional()
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   @MaxLength(100, { message: validationConstants.MAX_LENGTH })
//   filterValue: string;

//   @IsOptional()
//   @IsIn(validationConstants.VALIDATE_TOOLTIPS.TOOLTIPS_LISTING_FILTER_CONDITIONS, {
//     message: 'Filter Condition must be of the following values: $constraint1'
//   })
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   filterCondition: string;
  
//   @IsOptional()
//   @IsMongoId({
//     message: validationConstants.IS_OBJECT_ID
//   })
//   _id: string;

//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   pages?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   limit?: number;
// }
// export class UpdateToolTipsValidation {
//   @IsNotEmpty({ message: validationConstants.REQUIRED })
//   @IsMongoId({
//     message: validationConstants.IS_OBJECT_ID
//   })
//   tooltipsId: string;
//   @IsNotEmpty({ message: validationConstants.REQUIRED })
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   module: string;
  
//   @IsNotEmpty({ message: validationConstants.REQUIRED })
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   page: string;

//   @IsOptional()
//   @IsString({ message: validationConstants.IS_STRING_TYPE })
//   tooltipMessage: string;

//   @IsOptional()
//   @IsString({ message: validationConstants.IS_NUMBER_TYPE })
//   setOrder: number;
// }

// export class ToolTipsStatusChange {
//   @IsNotEmpty({
//     message: validationConstants.REQUIRED
//   })
//   @IsMongoId({
//     message: validationConstants.IS_OBJECT_ID
//   })
//   tooltipsId: string;
//   @IsNotEmpty({ message: validationConstants.REQUIRED })
//   @IsIn(databaseConstants.DB_STATUS, { message: validationConstants.IS_STATUS })
//   toottipsStatus: string;
// }
