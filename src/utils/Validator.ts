/* eslint-disable @typescript-eslint/no-unused-vars */
import Joi from 'joi';
import customValidations from './customValidations';
import { ApiError } from './ApiError';
import errorMessages from '../constants/errorMessages';

interface ExtendedStringSchema {
  /** Validates if the provided string is a valid json string */
  json(): this;
}
declare module 'joi' {
  interface StringSchema extends ExtendedStringSchema {}
}

// ********* Custom Extensions *********

// Extend the joi string ruleset. Add a rule to validate json
const jsonExtension = (joi: Joi.Root) => {
  return {
    base: joi.string(),
    type: 'string',
    messages: {
      'json.base': '{{#label}} must be a valid json string'
    },
    rules: {
      json: {
        method() {
          return this.$_addRule('json');
        },
        validate(value, helpers, args, options) {
          try {
            JSON.parse(value);
            return value;
          } catch (error) {
            return helpers.error('json.base');
          }
        }
      }
    }
  } as Joi.Extension;
};

const JoiStringExtended: Joi.Root = Joi.extend(jsonExtension);

// ********* Common validation functions for all data types *********
const applyCommonValidators = (validator) => {
  validator.required = () => {
    validator.schema = validator.schema.required();
    return validator;
  };

  validator.allowEmpty = () => {
    if (validator.schema?.type === 'string') {
      validator.schema = validator.schema.allow('');
    }
    validator.schema = validator.schema.allow(null);
    return validator;
  };

  return validator;
};
/**
 * Applies a validtion that makes the field mandatory if the ref field value = true
 * @param schema
 * @param ref
 * @returns
 */
const applyMandatoryIfRefIsTrue = (schema, ref: Joi.Reference) => {
  return schema.when(ref, {
    is: true,
    then: Joi.required().messages({
      'any.required': `{{#label}} is required because ${ref.display} is true`
    })
  });
};

const applyMandatoryRefExists = (schema, ref: Joi.Reference) => {
  return schema.when(ref, {
    is: Joi.exist(),
    then: Joi.required().messages({
      'any.required': `{{#label}} is required when ${ref.display} is present.`
    })
  });
};

/**
 * Validator class with static methods to create validation schemas using Joi.
 */
export default class Validator {
  /**
   * Returns a Joi schema for string validation with various chaining methods.
   * @returns {Object} Joi schema with chaining methods.
   */
  static string() {
    const validator = {
      schema: JoiStringExtended.string(),
      equals(customValue) {
        this.schema = this.schema.equal(customValue);
        return this;
      },
      alpha() {
        this.schema = this.schema.pattern(/^[a-zA-Z,.\s]*$/, { name: 'alpha' }).messages({
          'string.pattern.name': '{{#label}} must be alphabetic'
        });
        return this;
      },
      alphanum() {
        Joi.string().pattern(/a/);
        this.schema = this.schema.pattern(/^[a-zA-Z0-9,.\s]*$/, { name: 'alphanum' }).messages({
          'string.pattern.name': '{{#label}} must be alphanumeric'
        });
        return this;
      },
      alnumWithSpecialChars() {
        this.schema = this.schema
          .pattern(/^[a-zA-Z0-9,.\s!#$%&’'`:*+/=?^_{|}@óéć~\-–“”()]*$/, {
            name: 'alnumWithSpecialChars'
          })
          .messages({
            'string.pattern.name': `{{#label}} must be alphanumeric with the allowed list of special characters`
          });
        return this;
      },
      max(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.max(value);
        return this;
      },
      min(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.min(value);
        return this;
      },
      pattern(customValue: string) {
        try {
          this.schema = this.schema.pattern(RegExp(customValue));
          return this;
        } catch (error) {
          throw new ApiError(
            400,
            errorMessages.validation.BAD_VALIDATION_CONFIG.errorMessage + ' Invalid regex pattern!',
            errorMessages.validation.BAD_VALIDATION_CONFIG.emooneedsCode
          );
        }
      },
      uri() {
        this.schema = this.schema.uri();
        return this;
      },
      /**
       * Specifies that the string must be one of the allowed values.
       * @returns {Object} Updated schema with valid(..values) validation.
       */
      valueSubSetOf(customValue: string[]) {
        const isref = Joi.isRef(customValue);
        if (isref) {
          // create an in-reference. Ref: https://joi.dev/api/?v=17.12.0#refkey-options
          customValue.in = true;
          this.schema = this.schema
            .valid(customValue)
            .insensitive()
            .messages({
              'any.only': `{{#label}} with value "{{#value}}" must be one of the values in "${customValue.display}"`
            });
        } else {
          this.schema = this.schema
            .valid(...customValue)
            .insensitive()
            .messages({
              'any.only': `{{#label}} with value "{{#value}}" must be one of the allowed master values configured for this attribute`
            });
        }
        return this;
      },
      async packageIdCheck() {
        this.schema = this.schema.custom(await customValidations.packageIdCheck());
        return this;
      },
      json() {
        this.schema = this.schema.json();
        return this;
      },
      extendedEpisodeNumber(payload) {
        this.schema = this.schema.external(customValidations.extendedEpisodeNumber(payload));
        return this;
      },
      dvrValidator(payload) {
        this.schema = this.schema.custom(customValidations.dvrValidator(payload));
        return this;
      },
      drmVideoKid() {
        this.schema = this.schema.external(customValidations.drmVideoKid());
        return this;
      },
      episodicRangeOverlap(payload) {
        this.schema = this.schema.external(customValidations.episodicRangeOverlap(payload));
        return this;
      },
      async mandatoryContentProviderCheck() {
        this.schema = this.schema.external(await customValidations.mandatoryContentProviderCheck());
        return this;
      },
      valueSubSetOfMaster(customValue: string[]) {
        this.schema = this.schema.custom(customValidations.valueSubSetOfMaster(customValue));
        return this;
      },
      mandatoryIfPresent(ref: Joi.Reference) {
        this.schema = applyMandatoryRefExists(this.schema, ref)
        return this;
      },
      mandatoryIfRefisTrue(ref: Joi.Reference) {
        this.schema = applyMandatoryIfRefIsTrue(this.schema, ref);
        return this;
      },
      async parentalRating() {
        this.schema = this.schema.custom(await customValidations.parentalRating());
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  /**
   * Returns a Joi schema for numeric validation with various chaining methods.
   * @returns {Object} Joi schema with chaining methods.
   */
  static number() {
    const validator = {
      schema: Joi.number(),
      greaterThan(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        if (isRef) {
          // String references are not implicitly converted and result in joi ref error
          // To correct that, the ref needs to be adjusted
          customValue.adjust = (value) => Number(value);
        }
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.greater(value);
        return this;
      },
      lessThan(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        if (isRef) {
          customValue.adjust = (value) => Number(value);
        }
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.less(value);
        return this;
      },
      greaterThanEquals(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        if (isRef) {
          customValue.adjust = (value) => Number(value);
        }
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.min(value);
        return this;
      },
      lessThanEquals(customValue: number | Joi.Reference) {
        const isRef = Joi.isRef(customValue);
        if (isRef) {
          customValue.adjust = (value) => Number(value);
        }
        const value = isRef ? customValue : Number(customValue);
        this.schema = this.schema.max(value);
        return this;
      },
      cuePointLessThanDuration(customValue: Joi.Reference) {
        customValue.adjust = (value) => Number(value) + 1;
        customValue.display += '+1';
        this.schema = this.schema.max(customValue);
        return this;
      },
      naturalNumber() {
        this.schema = this.schema.integer().positive();
        return this;
      },
      seasonNumber(payload) {
        this.schema = this.schema.external(customValidations.validateUniqueSeasonNumber(payload));
        return this;
      },
      episodeNumber(payload) {
        this.schema = this.schema.external(customValidations.episodeNumber(payload));
        return this;
      },
      seasonNumberRequiredCheck() {
        this.schema = this.schema.external(customValidations.seasonNumberRequiredCheck());
        return this;
      },
      async mandatoryContentProviderCheck() {
        this.schema = this.schema.external(await customValidations.mandatoryContentProviderCheck());
        return this;
      },
      mandatoryIfPresent(ref: Joi.Reference) {
        this.schema = applyMandatoryRefExists(this.schema, ref)
        return this;
      },
      mandatoryIfRefisTrue(ref: Joi.Reference) {
        this.schema = applyMandatoryIfRefIsTrue(this.schema, ref);
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  /**
   * Returns a Joi schema for date validation with various chaining methods.
   * @returns {Object} Joi schema with chaining methods.
   */
  static date() {
    const validator = {
      schema: Joi.date(),
      dateGreaterThan(customValue) {
        this.schema = this.schema.greater(customValue);
        return this;
      },
      dateLessThan(customValue) {
        this.schema = this.schema.less(customValue);
        return this;
      },
      dateGreaterThanEquals(customValue) {
        this.schema = this.schema.min(customValue);
        return this;
      },
      dateLessThanEquals(customValue) {
        this.schema = this.schema.max(customValue);
        return this;
      },
      iso() {
        this.schema = this.schema.iso();
        return this;
      },
      async mandatoryContentProviderCheck() {
        this.schema = this.schema.external(await customValidations.mandatoryContentProviderCheck());
        return this;
      },
      mandatoryIfPresent(ref: Joi.Reference) {
        this.schema = applyMandatoryRefExists(this.schema, ref)
        return this;
      },
      mandatoryIfRefisTrue(ref: Joi.Reference) {
        this.schema = applyMandatoryIfRefIsTrue(this.schema, ref);
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  /**
   * Returns a Joi schema for array validation with various chaining methods.
   * @returns {Object} Joi schema with chaining methods.
   */
  static array() {
    const validator = {
      schema: Joi.array(),
      items(item: Joi.SchemaLikeWithoutArray) {
        this.schema = this.schema.items(item);
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  static boolean() {
    const validator = {
      schema: Joi.boolean(),
      subSetOf(customValue: string[]) {
        this.schema = this.schema.valid(...customValue);
        return this;
      },
      mandatoryIfPresent(ref: Joi.Reference) {
        this.schema = applyMandatoryRefExists(this.schema, ref)
        return this;
      },
      mandatoryIfRefisTrue(ref: Joi.Reference) {
        this.schema = applyMandatoryIfRefIsTrue(this.schema, ref);
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  static json() {
    const validator = {
      schema: Joi.object(),
      keys(customValue: Joi.PartialSchemaMap) {
        this.schema = this.schema.keys(customValue);
        return this;
      },
      cuePoints(payload) {
        this.schema = this.schema.custom(customValidations.cuePoints(payload));
        return this;
      },
      countryForRatings() {
        this.schema = this.schema.custom(customValidations.countryRating());
        return this;
      },
      countryForPreviewAndDuration() {
        this.schema = this.schema.custom(customValidations.countryForPreviewAndDuration());
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  static image() {
    const validator = {
      schema: Joi.object({
        title: Joi.string(),
        targeting: Joi.array().items(Joi.string()),
        segmentId: Joi.string().allow(''),
        url: Joi.string(),
        aspectRatio: Joi.string(),
        resolution: Joi.string(),
        variantId: Joi.string(),
        imageKey: Joi.string()
      }).unknown(true),
      validateAspectRatio() {
        return this;
      },
      validateResolution() {
        return this;
      },
      validateFileType(payload) {
        this.schema = this.schema.external(customValidations.validateImageType(payload));
        return this;
      },
      validateUniqueCountry(payload) {
        this.schema = this.schema.external(customValidations.validateUniqueCountry(payload));
        return this;
      },
      validateAllowedCountries(payload) {
        this.schema = this.schema.external(customValidations.validateAllowedCountries(payload));
        return this;
      }
    };
    applyCommonValidators(validator);
    return validator;
  }

  /**
   * Returns a Joi schema for executing your own validation code.
   * For async code, use customAsync
   * @returns {Object} Joi schema with custom rule
   */
  static custom() {
    return {
      schema: Joi.any(),
      custom(callback: Joi.CustomValidator) {
        this.schema = this.schema.custom(callback);
        return this;
      },
      /**
       * Runs the provided callback asynchronously after ALL other validations are complete
       */
      customAsync(callback: Joi.ExternalValidationFunction) {
        this.schema = this.schema.external(callback);
        return this;
      }
    };
  }

  static readonly STRING = this.string;
  static readonly NUMBER = this.number;
  static readonly DATE = this.date;
  static readonly ARRAY = this.array;
  static readonly BOOLEAN = this.boolean;
  static readonly JSON = this.json;
  static readonly IMAGE_TYPE = this.image;
  static readonly CUSTOM = this.custom;
}
