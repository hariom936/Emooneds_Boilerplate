import { mongo } from 'mongoose';
import contentConstants from '../constants/contentConstants';
import { BlitzCodeModel } from '../models';
import errorMessages from '../constants/errorMessages';

/**
 * Increments a counter for provided asset category within a transaction
 * @param session
 * @param assetCategory
 * @returns
 */
export const generateBlitzID = async (session: mongo.ClientSession, assetCategory: string) => {
  const emooneedsCode = await BlitzCodeModel.findOneAndUpdate(
    { assetCategory: assetCategory },
    { $inc: { counter: 1 } },
    { new: true }
  ).session(session);
  return emooneedsCode;
};

/**
 * Constructs a blitz Id/content Id from the given counter, prefixCode & optional prefixSize
 * @param currentCounter
 * @param prefixCode
 * @param prefixedSize
 * @returns
 */
export const blitzCodeFormatter = (
  currentCounter: number,
  prefixCode: number,
  prefixedSize: number = contentConstants.CONTENT_ID_MIN_SIZE
) => {
  const emooneedsCode = prefixCode + currentCounter.toString().padStart(prefixedSize, '0');
  return parseInt(emooneedsCode);
};

export const validateCuePoints = (cuePoints, contentDurationInSeconds) => {
  const contentDuration = Number(contentDurationInSeconds);
  for (const cuePoint of cuePoints) {
    if ('cuepointStartTime' in cuePoint && 'cuepointEndTime' in cuePoint) {
      const startTime = Number(cuePoint.cuepointStartTime);
      const endTime = Number(cuePoint.cuepointEndTime) || startTime;
      if (
        startTime < 0 ||
        startTime > contentDuration ||
        endTime < 0 ||
        endTime > contentDuration ||
        endTime < startTime
      ) {
        return cuePoint?.cuepointType != undefined
          ? `of ${cuePoint?.cuepointType} has invalid start-time or end-time`
          : `has invalid start-time or end-time`;
      }
      return true;
    } else {
      return `${errorMessages.customValidations.cuePoints.INVALID_CUEPOINTS_KEY}`;
    }
  }
};

/**
 *
 * @param assetCategory
 * @returns
 */
export const generateBlitzIDSessionLess = async (assetCategory: string) => {
  const emooneedsCode = await BlitzCodeModel.findOneAndUpdate(
    { assetCategory: assetCategory },
    { $inc: { counter: 1 } },
    { new: true }
  );
  return emooneedsCode;
};
