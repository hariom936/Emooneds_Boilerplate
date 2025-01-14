// import { dataSourceArray } from './databaseConstants';
// const VALIDATE_MASTER_VALUES = [...dataSourceArray.map((v) => v.key), ''];

export default {
  REQUIRED: '$property is required.',
  IS_STRING_TYPE: '$property should be type of string.',
  IS_NUMBER_TYPE: '$property should be type of Number.',
  IS_DATE_TYPE: '$property should be a valid date.',
  IS_POSITIVE: '$property should be a number.',
  IS_OBJECT_TYPE: '$property should be type of object.',
  IS_OBJECT_ID: '$property should be valid id.',
  IS_ARRAY_OF_OBJECT_ID: 'Each value in $property must be a valid ObjectId',
  ACCEPT_ONLY_CHARACTER: '$property will only accept character.',
  MAX_LENGTH: '$property can accept maximum $constraint1 characters.',
  MIN_LENGTH: '$property must have minimum $constraint1 characters.',
  INVALID_VALUE: '$property is having invalid value.',
  IS_ARRAY: '$property should be an Array.',
  IS_STATUS: '$property is invalid.',
  IS_inheritanceRule: '$property is invalid.',
  IS_BOOLEAN_TYPE: '$property should be type of boolean.',
  ALLOWED_SPECIAL_CHARS: /^[a-zA-Z0-9\s!#$%&'*+\/=?^_.`{|}~-]+$/,
  NO_PAST_DATE: '$property should not be a past date',
  NOT_FOUND: 'No record matching $property was found',
  INVALID_DATE_FORMAT: 'Invalid Date Format',
  IS_UUID: '$property should be type of uuid',
  COUNTRY_MASTER: {
    ALLOWED_COUNTRY_KEY_REGEX: /^_[a-zA-Z]+$/,
    ALLOWED_COUNTRY_VALUE_REGEX: /^[^0-9]*$/
  },
  LIST: {
    PAGE_REQUIRED: 'Page is Required',
    SORT_BY_VALID_VALUES: 'Sort By must be of the following values: $constraint1',
    SORT_TYPE_VALID_VALUES: 'Sort type must be of the following values: $constraint1'
  },
  VALIDATE_ROLE: {
    MISSING_PERMISSION: 'It seems there is a missing permission.',
    MISSING_SUBMODULE: 'It seems there is a missing submodule.',
    INVALID_PERMISSION_VALUE_KEY: 'is invalid value for permission.key field.',
    INVALID_PERMISSION_VALUE_DISPLAY_NAME: 'is invalid value for permission.displayName.',
    INVALID_PERMISSION_SUBMODULE_VALUE_KEY: 'is invalid value for permission.submodules.key field.',
    INVALID_PERMISSION_SUBMODULE_VALUE_DISPLAY_NAME:
      'is invalid value for permission.submodules.displayName.',
    INVALID_PERMISSION_SUBMODULE_VALUE_PERMISSION:
      'is invalid value for permission.submodules.permission.'
  },
  
};
