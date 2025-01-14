// import { Service } from 'typedi';
// import { ToolTipsModel } from '../../../models/Menus';
// import apiConfigs from '../../../config/apiConfigs';

// @Service()
// export class ToolTipsService {
//   /**
//    * tooltips method is used to fetch tool tips data by applying filter and sorting from tooltips collection
//    * @param {Object} filters
//    * @returns
//    */

//   // Get List

//   public async getTooltips(filters) {
//     const toolTipsSearchApiFilterConditions = apiConfigs.apiSearchFilterConditions;
//     const pages = filters?.page ?? toolTipsSearchApiFilterConditions.defaultPageNum;
//     const limit = filters?.limit ?? toolTipsSearchApiFilterConditions.defaultLimit; 
//     const queryCondition = {};
//     let filterBy = filters?.filterBy;
//     const {  filterCondition, filterValue } = filters;
  

//     if (filterBy) {
//       switch (filterCondition) {
//         case toolTipsSearchApiFilterConditions.isEqualTo:
//           queryCondition[filterBy] = { $eq: filterValue || '' };
//           break;
//         case toolTipsSearchApiFilterConditions.isNotEqualTo:
//           queryCondition[filterBy] = { $ne: filterValue || '' };
//           break;
//         case toolTipsSearchApiFilterConditions.startsWith:
//           const startsWithRegex = new RegExp(`^${filterValue}*`);
//           queryCondition[filterBy] = { $regex: startsWithRegex, $options: 'i' };
//           break;
//         case toolTipsSearchApiFilterConditions.endsWith:
//           const endsWithRegex = new RegExp(`${filterValue}$`);
//           queryCondition[filterBy] = { $regex: endsWithRegex, $options: 'i' };
//           break;
//         case toolTipsSearchApiFilterConditions.contains:
//           const containsRegex = new RegExp(`${filterValue}`);
//           queryCondition[filterBy] = { $regex: containsRegex, $options: 'i' };
//           break;
//         case toolTipsSearchApiFilterConditions.nullValue:
//           queryCondition[filterBy] = '';
//           break;
//       }
//     } else {
//       filterBy = '_id';
//       queryCondition[filterBy] = { $ne: null };
//     }
//     const skip = (pages - 1) * limit;

//     const pipeline = [
//       {
//         $match: queryCondition
//       },
//       {
//         $skip: skip
//       },
//       {
//         $limit: limit
//       }
//     ];

//     const count = await ToolTipsModel.count(queryCondition);
//     const records = await ToolTipsModel.aggregate(pipeline, {
//       collation: { locale: 'en', strength: 2 }
//     });

//     return {
//       count,
//       records
//     };
//   }

//   // Data Update
//   public async editTooltips(tooltipRequest, user) {
//     const update = {
//       updatedBy: user.userId,
//       _id: tooltipRequest.tooltipsId
//     };

//     if (tooltipRequest.module) {
//       update['module'] = tooltipRequest.module;
//     }
//     if (tooltipRequest.page) {
//       update['page'] = tooltipRequest.page;
//     }
//     if (tooltipRequest.tooltipMessages) {
//       update['tooltipMessages'] = tooltipRequest.tooltipMessages;
//     }
//     if (tooltipRequest.sortOrder) {
//       update['sortOrder'] = tooltipRequest.sortOrder;
//     }
//     if (tooltipRequest.status) {
//       update['status'] = tooltipRequest.status;
//     }
//     await ToolTipsModel.updateOne({ _id: tooltipRequest.tooltipsId }, update);

//     const updateToolTipsData = await ToolTipsModel.findOne({
//       _id: tooltipRequest.tooltipsId
//     });

//     return { updateToolTipsData, newData: update };
//   }
// }
