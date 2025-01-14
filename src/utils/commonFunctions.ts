import mongoose from 'mongoose';
import _ from 'lodash';
import { randomBytes } from 'crypto';

/**
 * Convert a mongoose document or array of documents to a more readable json
 * _id is always converted to id : string and any Object ID is serialized to string
 * @param {mongoose.Document| mongoose.Document[]} document - The document or list of docs to format
 * @param {string[]} remove - List of keys to remove from the formatted doc
 * @returns {JSON | JSON[]}
 */
const documentToJSON = (
  document: mongoose.Document | mongoose.Document[],
  remove: string[] = ['_id', '__v']
) => {
  if (!document) return document;
  if (Array.isArray(document)) {
    return document.map((v) => {
      const jsonDoc = _.mapValues(v.toJSON(), (value) => {
        return value instanceof mongoose.Types.ObjectId ? value + '' : value;
      });
      return { ..._.omit(jsonDoc, remove), id: v.id };
    });
  } else {
    return { ..._.omit(document.toJSON(), remove), id: document.id };
  }
};

interface KeyOptions {
  [key: string]: {
    $ne?: string | number | boolean | Date;
    $eq?: string | number | boolean | Date;
    $regex?: string;
    $options?: string;
    $gt?: number | Date;
    $gte?: number | Date;
    $lt?: number | Date;
    $lte?: number | Date;
    $in?: string[];
  };
}

interface ICommonFilterOpts {
  /**
   * Returns an empty filter '{}' if any comparison values are undefined.
   * Useful when you want to just fetch all data in case any filters are undefined.
   * Set to false by default
   */
  ignoreUndefinedValue?: boolean;
}

const CommonFilter = class {
  settings: ICommonFilterOpts;
  keyOptions: KeyOptions | Record<string, never>;
  keyName: string;

  constructor(keyName: string, opts?: ICommonFilterOpts) {
    this.settings = {
      ignoreUndefinedValue: false
    };
    Object.assign(this.settings, opts);
    this.keyName = keyName;
    this.keyOptions = {
      [keyName]: {}
    };
  }
  equals(value?) {
    this.keyOptions[this.keyName].$eq = value;
    return this;
  }
  notEquals(value?: string) {
    this.keyOptions[this.keyName].$ne = value;
    return this;
  }
  startsWith(value?: string) {
    this.keyOptions[this.keyName].$regex = `^${value}`;
    this.keyOptions[this.keyName].$options = 'i';
    return this;
  }
  endsWith(value?: string) {
    this.keyOptions[this.keyName].$regex = `${value}$`;
    this.keyOptions[this.keyName].$options = 'i';
    return this;
  }
  contains(value?: string) {
    this.keyOptions[this.keyName].$regex = value;
    this.keyOptions[this.keyName].$options = 'i';
    return this;
  }
  greaterThan(value) {
    this.keyOptions[this.keyName].$gt = normalizeValue(value);
    return this;
  }
  greaterThanEquals(value) {
    this.keyOptions[this.keyName].$gte = normalizeValue(value);
    return this;
  }
  lessThan(value) {
    this.keyOptions[this.keyName].$lt = normalizeValue(value);
    return this;
  }
  lessThanEquals(value) {
    this.keyOptions[this.keyName].$lte = normalizeValue(value);
    return this;
  }
  in(value) {
    this.keyOptions[this.keyName].$in = normalizeValue(value);
    return this;
  }
  generate({
    filterName,
    filterValue
  }: {
    filterName?:
      | 'equals'
      | 'notEquals'
      | 'startsWith'
      | 'endsWith'
      | 'contains'
      | 'greaterThan'
      | 'greaterThanEquals'
      | 'lessThan'
      | 'lessThanEquals'
      | 'in';
    filterValue?: string;
  } = {}) {
    if (!this.keyName) return {};
    const hasUndefValues = Object.values(this.keyOptions[this.keyName]).some(
      (v) => v === undefined
    );
    if (this.settings.ignoreUndefinedValue && hasUndefValues) return {};
    if (typeof filterName === 'string') {
      this[filterName](filterValue);
    }
    return this.keyOptions;
  }
};

export const isISODate = (str) => {
  // Regular expression to match ISO 8601 date format
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;
  return isoDateRegex.test(str);
};

export const isNumber = (str) => {
  const converted = Number(str);
  return !isNaN(converted);
};

export const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    // Check if it's a date string
    if (isISODate(value)) {
      return new Date(value);
    }

    // Check if it's a number string
    if (isNumber(value)) {
      return Number(value);
    }

    // Otherwise, return the string as is
    return value;
  }

  // For non-string values, return them as is
  return value;
};

const replaceAll = (strVal, match, replace) => {
  return strVal.replace(new RegExp(match, 'g'), () => replace);
};

const stringToUpperCase = (valueString) => {
  let newValue = valueString;
  if (newValue.includes(' ')) {
    newValue = replaceAll(newValue, ' ', '_');
  }
  if (newValue.includes('_/')) {
    newValue = replaceAll(newValue, '_/', '/');
  }
  if (newValue.includes('/_')) {
    newValue = replaceAll(newValue, '/_', '/');
  }
  if (newValue.includes('_/_')) {
    newValue = replaceAll(newValue, '_/_', '/');
  }
  return newValue.toUpperCase();
};

const arrayColumn = (arr, n) => arr.map((x) => x[n]);
const isValidId = (id) => {
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    return mongoose.Types.ObjectId.isValid(objectId);
  } catch (error) {
    return false;
  }
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
const checkRangesValidity = (array) => {
  for (let i = 0; i < array.length; i++) {
    const [start1, end1] = array[i].split('-').map(Number);
    for (let j = 0; j < array.length; j++) {
      if (i !== j) {
        const [start2, end2] = array[j].split('-').map(Number);
        if (!(end1 < start2 || start1 > end2)) {
          return `Ranges ${array[i]} and ${array[j]} overlap.`;
        }
      }
    }
  }
  return array;
};

export const omitNullOrEmptyKeys = (obj) => {
  // Recursively iterate through object properties
  return _.transform(
    obj,
    (result, value, key) => {
      // If the value is an object, recursively iterate through its properties
      if (_.isPlainObject(value)) {
        // Recurse into nested object
        const nestedObj = omitNullOrEmptyKeys(value);
        if (!_.isEmpty(nestedObj)) {
          // Omit nested object if it's empty after removing null and empty values
          result[key] = nestedObj;
        }
      } else if (
        !_.isNull(value) &&
        !(_.isString(value) && _.isEmpty(value)) &&
        !(_.isArray(value) && _.isEmpty(value))
      ) {
        // Omit keys with non-null, non-empty string, non-empty array values
        result[key] = value;
      }
    },
    {}
  );
};

/**
 * Recursively iterates over an object keys and sets all null valued keys to undefined.
 * Modifies the original param passed
 * @param obj
 * @returns
 */
export const convertEmptyToUndefined = (obj) => {
  // Iterate over each key-value pair in the object
  _.forOwn(obj, (value, key) => {
    // If the value is an object, recursively call convertEmptyToUndefined
    if (_.isPlainObject(value)) {
      convertEmptyToUndefined(value);
    }
    // If the value is an array, iterate over each element and apply convertEmptyToUndefined
    else if (_.isArray(value)) {
      value.forEach((element) => {
        if (_.isPlainObject(element)) {
          convertEmptyToUndefined(element);
        }
      });
    }
    // Convert null values to undefined
    if (value === null || value === '') {
      obj[key] = undefined;
    }
  });

  return obj;
};

export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

interface isPackageIdMatchParam {
  [key: string]: string[];
}

export const isPackageIdMatch = (obj1: isPackageIdMatchParam, obj2: isPackageIdMatchParam) => {
  const keys2 = Object.keys(obj2);

  // Check if all keys in obj1 are present in obj2 and have the same value
  for (const key of keys2) {
    const skus1 = new Set(obj1[key]);
    const skus2 = obj2[key];
    const isSubSet = skus2.every((v) => skus1.has(v));
    if (!isSubSet) {
      return false;
    }
  }
  return true;
};

const generateUUID = () => {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC4122
  return (
    bytes.toString('hex', 0, 4) +
    '-' +
    bytes.toString('hex', 4, 6) +
    '-' +
    bytes.toString('hex', 6, 8) +
    '-' +
    bytes.toString('hex', 8, 10) +
    '-' +
    bytes.toString('hex', 10, 16)
  );
};

/**
 * Takes a meta category object & keeps only the fields defined in schema, rest all
 * attributes are removed.
 * @param obj
 * @returns
 */
export const omitAttributes = (obj: object) => {
  // these keys exist at meta category level, rest all save data are attributes
  const metaCategoryModelKeys = [
    'metaCategory',
    'markDoneStatus',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt',
    'lockedBy',
    'lockedAt',
    'isDeleted'
  ];
  return _.pick(obj, metaCategoryModelKeys);
};

/**
 * Fetches an attributes value from available meta category data during validation
 * Returns undefined if key not found
 * @param metaCategories
 * @param keyName
 * @returns
 */
export const getValueFromMetacategories = (metaCategories, keyName) => {
  for (const category in metaCategories) {
    if (metaCategories[category][keyName] !== undefined) {
      return metaCategories[category][keyName];
    }
  }
};

export {
  documentToJSON,
  CommonFilter,
  stringToUpperCase,
  arrayColumn,
  isValidId,
  isValidUrl,
  checkRangesValidity,
  generateUUID
};
