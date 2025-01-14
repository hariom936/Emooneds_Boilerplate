import { AssetTypeDefinitionModel, ContentModel, SystemConfigurationsModel } from '../models';
import assert from 'assert';
import mongoose from 'mongoose';
import { dbStatus } from '../types/customDatabaseTypes';
import Validator from './Validator';
import Joi from 'joi';
import { IAssetTypeDefinition, IAttribute, IMetaAttribute } from '../models/AssetTypeDefinition';
import { ApiError } from './ApiError';
import httpStatus from 'http-status';
import errorMessages from '../constants/errorMessages';
import { isAsyncFunction } from 'util/types';

interface IGenerateSingleSchemaOptions {
  level?: 1 | 2 | 3 | 4; // 1=basic data shape, 2=required fields, 3=full validation
}

export interface ISchemaGeneratorOpts extends IGenerateSingleSchemaOptions {
  category?: string;
}

export const schemaGenerator = async (contentId: string, opts: ISchemaGeneratorOpts = {}) => {
  // default options
  const defaultOpts = Object.assign(
    { ...opts },
    {
      level: 3,
      ...opts
    }
  );

  const schema = {};

  const projectionCond = {};

  if (defaultOpts.category) {
    projectionCond['$eq'] = ['$$item.metaCategory', defaultOpts.category];
  } else {
    projectionCond['$ne'] = ['$$item.metaCategory', null];
  }

  const content = await ContentModel.findById(contentId).select({
    assetType: 1,
    assetCategory: 1,
    contentCategory: 1
  });

  const [assetTypeDef]: (IAssetTypeDefinition & { allAttributes: IAttribute[] })[] =
    await AssetTypeDefinitionModel.aggregate([
      {
        $match: {
          assetType: content?.assetType,
          assetCategory: content?.assetCategory,
          contentCategory: content?.contentCategory
        }
      },
      {
        $project: {
          assetType: 1,
          assetCategory: 1,
          contentCategory: 1,
          status: 1,
          createdBy: 1,
          updatedBy: 1,
          attributes: {
            $filter: {
              input: '$attributes',
              as: 'item',
              cond: projectionCond
            }
          },
          allAttributes: '$attributes'
        }
      }
    ]);

  assert(Array.isArray(assetTypeDef.attributes), 'No meta attributes found');

  const allMetaAttributes = assetTypeDef.allAttributes;

  // { 123445566: assetTitle, 21345678: seasonNumber }
  const attributesToIdMap = assetTypeDef.attributes.reduce((acc, curr) => {
    curr.metaAttributes.forEach((attribute) => {
      const { fieldName, _id } = attribute;
      acc[_id + ''] = fieldName;
    });
    return acc;
  }, {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callbacks: any[] = [];

  for (const category of assetTypeDef.attributes || []) {
    const { metaCategory, metaAttributes } = category;
    schema[metaCategory] = {}; // => { DESCRIPTIVE_METADATA: {} }

    for (const attribute of metaAttributes) {
      const { fieldName, attributeRef, dataType, isMultiple } = attribute;
      // If complex type, push in callbacks and fill in all normal field validations
      if (dataType === 'JSON') {
        attributeRef.forEach((ref) => {
          const keyName = attributesToIdMap[ref._id + ''];
          ref['fieldName'] = keyName;
        });
        callbacks.push({
          fn: generateComplexSchema,
          args: [schema, metaCategory, fieldName, isMultiple, attributeRef]
        });
      }
      schema[metaCategory][fieldName] = await generateSingleSchema(
        attribute,
        metaCategory,
        allMetaAttributes,
        defaultOpts
      );
    }
  }

  callbacks.forEach((value) => {
    value.fn(...value.args);
  });

  return Joi.object(schema);
};

/**
 * Will search through all meta categories and their attributes and return a
 * clone of the given attribute if it exists. The returned reference is a joi schema.
 * It will also mark the existing attribute as optional. This will avoid the reference
 * being required as an individual separate attribute during validation
 * @param schema
 * @param attribute
 * @returns
 */
const findAttributeInSchema = (schema, attribute: string) => {
  let category: string = '';
  const attributeName = Object.keys(schema).find((metaCat) => {
    category = metaCat;
    return Object.keys(schema[metaCat]).includes(attribute);
  });
  if (attributeName) {
    const clone = schema[category][attribute].clone();
    schema[category][attribute] = schema[category][attribute].optional();
    return clone;
  }
};

const generateComplexSchema = (
  schema,
  metaCategory: string,
  fieldName: string,
  isMultiple: boolean,
  attributeRefs: { fieldName: string; sortOrder: number }[] = []
) => {
  const complexSchema = {};
  attributeRefs.forEach((ref) => {
    const keyName = ref.fieldName;
    const attribute = findAttributeInSchema(schema, keyName);
    if (!Joi.isSchema(attribute)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Attribute reference '${keyName}' not found for ${fieldName}!`,
        errorMessages.validation.INVALID_DATA.emooneedsCode
      );
    }
    complexSchema[keyName] = attribute;
  });

  schema[metaCategory][fieldName] = schema[metaCategory][fieldName].keys(complexSchema);
  if (isMultiple) {
    schema[metaCategory][fieldName] = Joi.array().items(schema[metaCategory][fieldName]);
  }
};

/**
 * Fetches list of master values from the provided master OR SystemConfigurations value
 * A system configuration master value will look like 'SystemConfigurations/CONTENT_CATEGORY'
 * @param dataSource
 * @returns
 */
const getDataSourceValues = async (dataSource: string) => {
  // Capitalize the first letter
  dataSource = dataSource.charAt(0).toUpperCase() + dataSource.slice(1);
  let masterData;
  if (dataSource.match(/^SystemConfigurations/)) {
    const [configKey] = dataSource.split('/').slice(-1);
    const configData = await SystemConfigurationsModel.findOne({
      configKey,
      status: dbStatus.ACTIVE
    })
      .select('configValue')
      .lean();

    if (!configData?.configValue) {
      return;
    }

    masterData = configData?.configValue;
    return masterData.map((v) => v.key);
  }
  const model = mongoose.models[dataSource];

  if (!model) {
    return;
  }
  masterData = await model.find({ status: dbStatus.ACTIVE }).select('key value').lean();
  return masterData.map((v) => v.key);
};

/**
 * Generates a joi schema for a single field
 * @param attribute
 * @param opts
 * @returns
 */
export const generateSingleSchema = async (
  attribute: IMetaAttribute,
  metaCategory: string,
  metaAttributes: IAttribute[],
  opts: IGenerateSingleSchemaOptions = {}
) => {
  // default options
  const defaultOpts = Object.assign(
    { ...opts },
    {
      level: 3,
      ...opts
    }
  );

  const { isMultiple, isRequired, fieldName } = attribute;

  const dataType: string = attribute.dataType!;
  const validations = attribute.validations;
  if (typeof Validator[dataType] !== 'function') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Validation is not supported for ${dataType} data type`,
      errorMessages.validation.INVALID_DATA.emooneedsCode
    );
  }

  // Level 1, basic validation
  let isRequiredCheck = false;
  const schemaBuilder = Validator[dataType](); // Eg:  Validator.string()

  // Level 2, mandatory validation
  if (isRequired && defaultOpts.level >= 2) {
    schemaBuilder.required(); // Validator.string().required()
    isRequiredCheck = true;
  }

  if (!isRequiredCheck) {
    schemaBuilder.allowEmpty();
  }

  // Level 3, full validation not going beyond this meta category
  if (defaultOpts.level >= 3) {
    for (const validationName in validations) {
      // skip empty/ bad data in db for validations like validation name = ''
      if (!validationName) continue;

      const validationConfig = validations[validationName];

      // check if the validation function is supported
      if (typeof schemaBuilder[validationName] !== 'function') {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `There is no validator function called ${validationName} for  ${dataType} data type. Attribute is ${fieldName}. Meta category is ${metaCategory}`,
          errorMessages.validation.INVALID_DATA.emooneedsCode
        );
      }
      let customValues;

      /*
       Precedence of values to be provided to validation function
       sourceAttribute->DataSource→Option
       ref: https://confluence.sonyliv.com/pages/viewpage.action?pageId=134907359
      */

      if (validationConfig.standard === false) {
        // Level 4 is full validation including comparison of attributes of different categories & all custom validations
        if (defaultOpts.level < 4) {
          // custom function validations will be covered under checklist level
          // skipped in regular mark done validation check
          continue;
        }
        /* customValues will supply all data possibly required by custom function to validate data
        These are typically complex functions with validations not supported by joi and are usually
        executing async code. The custom function must accept the validation config and payload
        These functions may be special but are defined in our Validator class itself just like our standard functions
        */
        customValues = { config: validationConfig };
      } else if (validationConfig.scope || validationConfig.sourceAttribute) {
        // get data reference for the provided scope + sourceAttribute
        // Only parent or self scope supported
        const sourceAttributeCategory = metaAttributes.find(
          (ma) =>
            ma.metaAttributes.findIndex(
              (attr) => attr.fieldName === validationConfig.sourceAttribute
            ) !== -1
        )?.metaCategory;

        const isCrossCategory =
          validationConfig.scope === 'parent' || sourceAttributeCategory !== metaCategory;
        if (isCrossCategory && defaultOpts.level < 4) {
          // cross category validations will be covered under checklist level
          continue;
        }

        customValues = Joi.ref(
          `$${validationConfig.scope}.metaCategories.${sourceAttributeCategory}.${validationConfig.sourceAttribute}`
        );
        customValues.display = `(${validationConfig.scope})${validationConfig.sourceAttribute}`;
      } else if (validationConfig.dataSource) {
        // fetch data from master
        customValues = await getDataSourceValues(validationConfig.dataSource);
        if (!customValues) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Provided datasource: ${validationConfig.dataSource} does not exist`,
            errorMessages.validation.INVALID_DATA.emooneedsCode
          );
        }
      } else if (validationConfig.customValues) {
        // use provided custom values
        customValues = validationConfig.customValues;
      }

      // add this rule to the validation schema
      if (Joi.isRef(customValues) && customValues.root === 'parent') {
        // use a clone of the reference because the origial reference is altered in the validator function which might throw Error: Invalid in() reference usage
        const refClone = (customValues as Joi.Reference & { clone: () => Joi.Reference }).clone();
        // If the comparison value is a parent reference, compare only if the parent value exists
        schemaBuilder.schema = schemaBuilder.schema.when(refClone, {
          is: Joi.exist(),
          then: Validator[dataType]()[validationName](customValues).schema
        });
      } else {
        if (isAsyncFunction(schemaBuilder[validationName])) {
          await schemaBuilder[validationName](customValues); // => Validator.string().required().min(2).max(10)
        } else {
          schemaBuilder[validationName](customValues); // => Validator.string().required().min(2).max(10)
        }
      }
    }
  }

  if (isMultiple && dataType !== 'JSON') {
    return Validator.array().items(schemaBuilder.schema).schema;
  }

  return schemaBuilder.schema; // => Joi.string().required().min(2).max(10)
};
