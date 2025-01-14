import {
  isPackageIdMatch,
  checkRangesValidity,
  getValueFromMetacategories
} from './commonFunctions';
/* eslint-disable @typescript-eslint/no-unused-vars */
import errorMessages from '../constants/errorMessages';
import mongoose from 'mongoose';
import {
  ContentMetaCategoryModel,
  ContentModel,
  ISystemConfigurations,
  SystemConfigurationsModel
} from '../models';
import { collectionNames } from '../constants/databaseConstants';
import { ContentMetaCategoryService } from '../api/v1.0.0/services/ContentMetaCategoryService';
import { S3Service } from '../api/v1.0.0/services/S3Service';
import _ from 'lodash';
import { EntitlementPackagesModel } from '../models/EntitlementPackages';
import { dbStatus } from '../types/customDatabaseTypes';
import logger from './logger';
import validationConstants from '../constants/validationConstants';
import authorizationConstants from '../constants/authorizationConstants';

function checkTargetingRepetition(obj) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const items = obj[key];
    const targetingValues = new Set();

    for (const item of items) {
      for (const target of item.targeting) {
        if (targetingValues.has(target)) {
          return true; // Found repetition
        }
        targetingValues.add(target);
      }
    }
  }
  return false; // No repetition found
}
const checkForOverlappingCuePoints = (cuePoints) => {
  const errors: string[] = [];
  const cuePointsData = cuePoints;
  cuePointsData.forEach((cuePoint) => {
    if (!(cuePoint.cuepointStartTime && cuePoint.cuepointEndTime)) {
      errors.push(errorMessages.customValidations.cuePoints.FILED_VALUE_ERROR);
    } else {
      cuePoint.cuepointStartTime = parseInt(cuePoint.cuepointStartTime.toString());
      cuePoint.cuepointEndTime = parseInt(cuePoint.cuepointEndTime.toString());
    }
  });

  if (errors.length > 0) {
    return errors.pop();
  }

  const sortedCuePoints = _.sortBy(cuePointsData, ['cuepointStartTime', 'cuepointEndTime']);
  for (let i = 1; i < sortedCuePoints.length; i++) {
    const prevCuePoint = sortedCuePoints[i - 1];
    const currentCuePoint = sortedCuePoints[i];
    if (currentCuePoint.cuepointStartTime < prevCuePoint.cuepointEndTime) {
      return errorMessages.customValidations.cuePoints.OVERLAP_CUEPOINTS_ERROR;
    }
  }
  return true;
};

const validateCountryRatingAndDuration = (data, key) => {
  const countrySet = new Set();
  for (const item of data) {
    const countries = item[key] ?? [];
    for (const country of countries) {
      if (countrySet.has(country)) {
        return `${country}`;
      }
      countrySet.add(country);
    }
  }
  return true;
};

export default {
  extendedEpisodeNumber: ({ config, payload }) => {
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const parentId = self?.parentId;
      const episodeNumber = self?.metaCategories?.DESCRIPTIVE_METADATA?.episodeNumber;
      const contentId = self?._id;
      const currentAllowedCountries = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.properties;
      // if no parent or episodeNumber, do not validate
      if (!parentId) return value;

      if (value && !episodeNumber) {
        return helpers.message(
          '{{#label}} ' +
            errorMessages.customValidations.extendedEpisodeNumber.EPISODE_NUMBER_REQUIRED
        );
      }

      const siblings = await ContentModel.aggregate([
        { $match: { parentId: parentId } },
        {
          $group: {
            _id: '$contentId',
            latestVersion: { $first: '$$ROOT' },
            versionCount: { $sum: 1 }
          }
        },
        {
          $sort: { updatedAt: -1 }
        },
        {
          $project: {
            _id: '$latestVersion._id'
          }
        }
      ]);

      const siblingIds = siblings.map((v) => v._id);
      const duplicates = await ContentMetaCategoryModel.count({
        contentId: { $in: siblingIds },
        $and: [
          {
            'attributes.episodeNumber': { $ne: null }
          },
          {
            $or: [
              { 'attributes.episodeNumber': episodeNumber + '' },
              { 'attributes.episodeNumber': parseInt(episodeNumber) }
            ]
          },
          {
            'attributes.extendedEpisodeNumber': { $ne: null }
          },
          {
            'attributes.extendedEpisodeNumber': value
          }
        ]
      });
      /**
       * code for check allowed countries inclusion
       */
      let isAllowedCountriesDuplicate = false;
      const excludedSiblings = siblingIds.filter((ele) => !ele.equals(contentId));
      const allowedCountriesResults = await ContentMetaCategoryModel.find({
        contentId: { $in: excludedSiblings },
        metaCategory: authorizationConstants.SUBMODULE.RIGHTS_AND_AVAILABILITY
      }).lean();

      isAllowedCountriesDuplicate = allowedCountriesResults.some((result) => {
        const allowedProperties = result?.attributes?.['properties'];
        return (
          allowedProperties &&
          currentAllowedCountries?.some((property) => allowedProperties?.includes(property))
        );
      });

      if (duplicates > 1 && isAllowedCountriesDuplicate) {
        return helpers.message(
          '{{#label}} ' +
            errorMessages.customValidations.extendedEpisodeNumber.DUPLICATE_EXT_EPISODE_NUMBER
        );
      }
      return value;
    };
    return customFunction;
  },
  episodeNumber: ({ config, payload }) => {
    const customFunction = async (value, helpers) => {
      const { self, parent } = helpers.prefs.context;
      const parentId = self.parentId;
      const contentId = self?._id;
      const currentAllowedCountries = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.properties;
      // const episodeNumber = self?.metaCategories?.DESCRIPTIVE_METADATA?.episodeNumber;

      // if no parent or episodeNumber, do not validate
      if (!parent) {
        return value;
      }

      const siblings = await ContentModel.aggregate([
        { $match: { parentId: parentId } },
        {
          $group: {
            _id: '$contentId',
            latestVersion: { $first: '$$ROOT' },
            versionCount: { $sum: 1 }
          }
        },
        {
          $sort: { updatedAt: -1 }
        },
        {
          $project: {
            _id: '$latestVersion._id'
          }
        }
      ]);

      const siblingIds = siblings.map((v) => v._id);
      const duplicates = await ContentMetaCategoryModel.count({
        metaCategory: 'DESCRIPTIVE_METADATA',
        contentId: { $in: siblingIds },
        $and: [
          { 'attributes.episodeNumber': { $ne: null } },
          {
            $or: [
              { 'attributes.episodeNumber': value + '' },
              { 'attributes.episodeNumber': parseInt(value) }
            ]
          }
        ],
        $or: [
          { 'attributes.extendedEpisodeNumber': { $exists: false } },
          { 'attributes.extendedEpisodeNumber': null }
        ]
      });

      /**
       * code for check allowed countries inclusion
       */
      let isAllowedCountriesDuplicate = false;
      const excludedSiblings = siblingIds.filter((ele) => !ele.equals(contentId));
      const allowedCountriesResults = await ContentMetaCategoryModel.find({
        contentId: { $in: excludedSiblings },
        metaCategory: authorizationConstants.SUBMODULE.RIGHTS_AND_AVAILABILITY
      })?.lean();

      isAllowedCountriesDuplicate = allowedCountriesResults?.some((result) => {
        const allowedProperties = result?.attributes?.['properties'];
        return (
          allowedProperties &&
          currentAllowedCountries?.some((property) => allowedProperties?.includes(property))
        );
      });
      if (duplicates > 1 && isAllowedCountriesDuplicate) {
        return helpers.message(
          '{{#label}} ' + errorMessages.customValidations.episodeNumber.DUPLICATE_EPISODE_NUMBER
        );
      }
      return value;
    };
    return customFunction;
  },
  dvrValidator: ({ config, payload }) => {
    const customFunction = (value, helpers) => {
      const { self } = helpers.prefs.context;
      const isDVR = self?.metaCategories?.CONTENT_MEDIA_VIDEO?.isDVR;
      const dvrUrl = self?.metaCategories?.CONTENT_MEDIA_VIDEO?.dvrUrl;

      if (!((isDVR && dvrUrl) || (!isDVR && !dvrUrl))) {
        return helpers.message(
          '{{#label}} ' + errorMessages.customValidations.dvrValidator.INCORRECT_DVR
        );
      }
      return value;
    };
    return customFunction;
  },
  validateUniqueSeasonNumber: ({ config, payload }) => {
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const { parentId, _id: contentId } = self;
      const currentAllowedCountries = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.['properties'];

      if (!parentId) {
        return value;
      }

      const pipeline = [
        {
          $match: {
            parentId: parentId,
            _id: { $ne: new mongoose.Types.ObjectId(contentId) }
          }
        },
        {
          $lookup: {
            from: collectionNames.ContentMetaCategory,
            localField: '_id',
            foreignField: 'contentId',
            as: 'ContentMetaCategory'
          }
        },
        {
          $match: {
            $or: [
              { 'ContentMetaCategory.attributes.season': value + '' },
              { 'ContentMetaCategory.attributes.season': parseInt(value) }
            ]
          }
        }
      ];
      const result = await ContentModel.aggregate(pipeline);

      const siblings = await ContentModel.aggregate([
        { $match: { parentId: parentId } },
        {
          $group: {
            _id: '$contentId',
            latestVersion: { $first: '$$ROOT' },
            versionCount: { $sum: 1 }
          }
        },
        {
          $sort: { updatedAt: -1 }
        },
        {
          $project: {
            _id: '$latestVersion._id'
          }
        }
      ]);

      const siblingIds = siblings.map((v) => v._id);
      /**
       * code for check allowed countries inclusion
       */
      let isAllowedCountriesDuplicate = false;
      const excludedSiblings = siblingIds.filter((ele) => !ele.equals(contentId));
      const allowedCountriesResults = await ContentMetaCategoryModel.find({
        contentId: { $in: excludedSiblings },
        metaCategory: authorizationConstants.SUBMODULE.RIGHTS_AND_AVAILABILITY
      }).lean();

      isAllowedCountriesDuplicate = allowedCountriesResults?.some((result) => {
        const allowedProperties = result?.attributes?.['properties'];
        return (
          allowedProperties &&
          currentAllowedCountries?.some((property) => allowedProperties?.includes(property))
        );
      });

      if (result.length > 0 && isAllowedCountriesDuplicate) {
        return helpers.message(
          '{{#label}} ' + errorMessages.customValidations.uniqueSeasonNumber.DUPLICATE_SEASON_NUMBER
        );
      }
      return value;
    };
    return customFunction;
  },
  validateAspectRatio: ({ config, payload }) => {
    const s3Service = new S3Service();
    const contentMetaCategoryService = new ContentMetaCategoryService(s3Service);
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const { metaCategories, _id: contentId } = self;
      const assetDefinRes = await contentMetaCategoryService.getAttributeDetails(contentId);
      if (assetDefinRes.length) {
        const imagesValidRes =
          assetDefinRes &&
          (await contentMetaCategoryService.mardDoneImageValidation(
            assetDefinRes[0],
            {
              attributes: metaCategories.CONTENT_MEDIA_IMAGE
            },
            value
          ));
        if (imagesValidRes.isAspectRatioError) {
          return helpers.message(
            '{{#label}} ' + errorMessages.customValidations.incorrectImageProperties.ASPECT_RATIO
          );
        }
        if (imagesValidRes.isResolutionError) {
          return helpers.message(
            '{{#label}} ' + errorMessages.customValidations.incorrectImageProperties.RESOLUTION
          );
        }
        return value;
      }
    };
    return customFunction;
  },
  validateUniqueCountry: ({ config, payload }) => {
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const { metaCategories } = self;
      const hasRepeatingTargets = checkTargetingRepetition(metaCategories.CONTENT_MEDIA_IMAGE);
      if (hasRepeatingTargets) {
        return helpers.message(
          '{{#label}} ' + errorMessages.customValidations.uniqueCountry.DUPLICATE_COUNTRY
        );
      }
      return value;
    };
    return customFunction;
  },
  cuePoints: ({ config, payload }) => {
    const customFunction = (value, helpers) => {
      try {
        const { self } = helpers.prefs.context;
        if (
          !self?.metaCategories?.CONTENT_MEDIA_VIDEO.hasOwnProperty('cuePointList') ||
          !Array.isArray(self?.metaCategories?.CONTENT_MEDIA_VIDEO?.cuePointList)
        ) {
          return helpers.message(
            '{{#label}} ' + errorMessages.customValidations.cuePoints.INVALID_CUEPOINTS
          );
        }
        const cuePoints = self?.metaCategories?.CONTENT_MEDIA_VIDEO?.cuePointList;
        const check = checkForOverlappingCuePoints(cuePoints);
        if (typeof check === 'string') {
          return helpers.message('{{#label}} ' + check);
        }
        return value;
      } catch (error) {
        return helpers.message(errorMessages.customValidations.common.VALIDATION_ERROR);
      }
    };
    return customFunction;
  },
  episodicRangeOverlap: ({ config, paylaod }) => {
    const customeFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const query = {
        $or: [{ blitzId: self.parentId, parentId: null }, { parentId: self.parentId }]
      };
      const data = await ContentModel.aggregate([
        { $match: query },
        { $project: { _id: 1 } },
        { $group: { _id: null, contentId: { $addToSet: '$_id' } } }
      ]);
      if (data[0].contentId.length >= 2) {
        const metaCategoryData = await ContentMetaCategoryModel.aggregate([
          {
            $match: { contentId: { $in: data[0].contentId }, metaCategory: 'DESCRIPTIVE_METADATA' }
          },
          { $project: { 'attributes.episodicRange': 1, _id: 0 } },
          {
            $group: {
              _id: null,
              episodeRanges: { $push: '$attributes.episodicRange' }
            }
          }
        ]);
        const duplicateRange = checkRangesValidity(metaCategoryData[0].episodeRanges);
        if (typeof duplicateRange === 'string') {
          return helpers.message('{{#label}} ' + duplicateRange);
        }
      }
    };

    return customeFunction;
  },
  countryRating: () => {
    const customFunction = (value, helpers) => {
      const { self } = helpers.prefs.context;
      if (
        self?.metaCategories.hasOwnProperty('RIGHTS_AND_AVAILABILITY') &&
        self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.hasOwnProperty('countryRating')
      ) {
        const countryRatingPayload = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.countryRating;
        const countryRatingRes = validateCountryRatingAndDuration(
          countryRatingPayload,
          'countryForRating'
        );
        if (typeof countryRatingRes === 'string') {
          return helpers.message(
            '{{#label}} ' +
              validationConstants.CUSTOM_VALIDATION_MESSAGES.COUNTRY_FOR_RATING +
              countryRatingRes
          );
        }
      }
      return value;
    };
    return customFunction;
  },
  validateAllowedCountries: ({ config, payload }) => {
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const { _id } = self;
      const s3Service = new S3Service();
      const contentMetaCategoryService = new ContentMetaCategoryService(s3Service);
      const isAllowedCountriesInSubset = await contentMetaCategoryService.validateAllowedCountries(
        _id,
        value
      );
      if (!isAllowedCountriesInSubset) {
        return helpers.message(
          '{{#label}} ' +
            errorMessages.customValidations.imageAllowedCountries.INVALID_TARGETING_COUNTRY
        );
      }
      return value;
    };
    return customFunction;
  },
  packageIdCheck: async () => {
    const packageIds = await EntitlementPackagesModel.find({ status: dbStatus.ACTIVE })
      .select('key')
      .lean();
    const normalizePackageId = (packageId: string) => {
      try {
        const jsonValue = JSON.parse(packageId);
        for (const key in jsonValue) {
          // Split the comma-separated values
          jsonValue[key] = jsonValue[key].split(',');
        }
        return jsonValue;
      } catch {
        logger.warn('Invalid JSON value detected while validating package');
        return {};
      }
    };
    const valid = packageIds.map((value) => normalizePackageId(value.key));

    const customFunction = (value, helpers) => {
      const packageIdMatches = valid.some((validValue) =>
        isPackageIdMatch(validValue, normalizePackageId(value))
      );
      if (!packageIdMatches) {
        return helpers.message(errorMessages.customValidations.packageIdCheck.INVALID_PACKAGE_ID);
      }
      return value;
    };
    return customFunction;
  },

  /**
   * Checks if the assets's content provider matches one of the values in
   * SystemConfigurations/SKIPPABLE_CONTENT_PROVIDERS. If yes, the field is non mandatory,
   * else the field is mandatory.
   * NOTE: isRequired Check overrides this validation
   * @returns
   */
  mandatoryContentProviderCheck: async () => {
    const contentProviders = await SystemConfigurationsModel.findOne({
      status: dbStatus.ACTIVE,
      configKey: 'SKIPPABLE_CONTENT_PROVIDERS'
    })
      .select('configValue')
      .lean();
    const skippable = contentProviders?.configValue.map((value) => value.key) ?? [];

    const customFunction = (value, helpers) => {
      const { self } = helpers.prefs.context;
      const contentProvider = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.contentProvider;
      const skipValidation = skippable.includes(contentProvider);
      if (!skipValidation && value === undefined) {
        return helpers.message(
          errorMessages.customValidations.mandatoryContentProviderCheck.FILE_KEY_REQUIRED
        );
      }
      return value;
    };
    return customFunction;
  },
  seasonNumberRequiredCheck: () => {
    const customFunction = (value, helpers) => {
      const { parent } = helpers.prefs.context;
      const required = parent && parent.assetType !== 'EPISODIC_SHOW';
      if (required && !value) {
        return helpers.message(
          errorMessages.customValidations.seasonNumberRequiredCheck.SEASON_INVALID
        );
      }
      return value;
    };
    return customFunction;
  },
  countryForPreviewAndDuration: () => {
    const customFunction = (value, helpers) => {
      const { self } = helpers.prefs.context;
      if (
        self?.metaCategories.hasOwnProperty('BUSINESS_RULES') &&
        self?.metaCategories?.BUSINESS_RULES?.hasOwnProperty('countryPreview')
      ) {
        const countryPreViewPayload = self?.metaCategories?.BUSINESS_RULES?.countryPreview;
        const countryPreviewRes = validateCountryRatingAndDuration(
          countryPreViewPayload,
          'previewCountry'
        );
        if (typeof countryPreviewRes === 'string') {
          return helpers.message(
            '{{#label}} ' +
              validationConstants.CUSTOM_VALIDATION_MESSAGES.COUNTRY_FOR_PREVIEW_DURATION +
              countryPreviewRes
          );
        }
      }
      return value;
    };
    return customFunction;
  },
  validateImageType: ({ config, payload }) => {
    const s3Service = new S3Service();
    const contentMetaCategoryService = new ContentMetaCategoryService(s3Service);
    const customFunction = async (value, helpers) => {
      const { self } = helpers.prefs.context;
      const { metaCategories, _id: contentId } = self;
      const assetDefinRes = await contentMetaCategoryService.getAttributeDetails(contentId);
      if (assetDefinRes.length) {
        const imagesValidRes =
          assetDefinRes &&
          (await contentMetaCategoryService.mardDoneImageTypeValidation(
            assetDefinRes[0],
            {
              attributes: metaCategories.CONTENT_MEDIA_IMAGE
            },
            value
          ));
        if (imagesValidRes.isImageTypeError) {
          return helpers.message(
            errorMessages.customValidations.incorrectImageProperties.FILE_TYPE
          );
        }
        return value;
      }
    };
    return customFunction;
  },
  drmVideoKid: () => {
    const customFunction = (value, helpers) => {
      const { self } = helpers.prefs.context;
      const drmType = self?.metaCategories?.RIGHTS_AND_AVAILABILITY?.drmType;
      const required = drmType && drmType !== 'NONE';
      if (required && !value) {
        return helpers.message(errorMessages.customValidations.drmVideoKid.DRM_IS_REQUIRED);
      }
      return value;
    };
    return customFunction;
  },
  valueSubSetOfMaster: (masterValues: string[] = []) => {
    const customFunction = (value, helpers) => {
      if (!value) return value;
      const valid = masterValues ?? [];
      const missing = !valid.includes(value);
      if (missing) {
        return helpers.message(errorMessages.customValidations.valueSubSetOfMaster.NOT_MASTER);
      }
      return value;
    };
    return customFunction;
  },

  parentalRating: async () => {
    const tableCheck = (await SystemConfigurationsModel.findOne({
      configKey: 'PARENT_RATING'
    })) as ISystemConfigurations;

    const customFunction = (value, helpers) => {
      const { self, parent } = helpers.prefs.context;
      const childMetaCategoryKeyValue = getValueFromMetacategories(
        self.metaCategories,
        'pcVodLabel'
      );
      const parentMetaCategoryKeyValue = getValueFromMetacategories(
        parent.metaCategories,
        'pcVodLabel'
      );
      if (!childMetaCategoryKeyValue) {
        return value;
      }
      const getOrderOfChild =
        tableCheck.configValue.find((item) => item.value === childMetaCategoryKeyValue)?.order ??
        99;
      const getOrderOfParent =
        tableCheck.configValue.find((item) => item.value === parentMetaCategoryKeyValue)?.order ??
        -1;
      if (getOrderOfChild > getOrderOfParent) {
        return helpers.message(
          errorMessages.customValidations.parentalRatingValidation.PARENTAL_ERROR
        );
      }
      return value;
    };
    return customFunction;
  }
};
