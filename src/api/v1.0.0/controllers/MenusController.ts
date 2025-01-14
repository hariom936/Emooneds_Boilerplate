// /**
//  * @author: Hariom Verma
//  * @file: src/api/v1.0.0/controllers/ToolTipsController.ts
//  * @description: Tool Tips fetch data and Update data.
//  */

// import {
//   JsonController,
//   Get,
//   Req,
//   Res,
//   UseBefore,
//   QueryParams,
//   Authorized,
//   Patch,
//   CurrentUser,
//   Body
// } from 'routing-controllers';
// import { Service } from 'typedi';
// import { apiRoute } from '../../../utils/apiSemver';
// import { versions as api, component, action } from '../../../constants/api';
// import { AuthJwt } from '../../../middlewares/AuthJwt';
// import { Request, Response } from 'express';
// import { ResponseService } from '../services/ResponseService';
// import { ToolTipsService } from '../services/ToolTipsService';
// import messages from '../../../constants/messages';
// import authorizationConstants from '../../../constants/authorizationConstants';
// // import errorMessages from '../../../constants/errorMessages';
// import { UserJwtPayload } from '../../../types/userToken';

// import { UserSession } from '../../../middlewares/UserSession';
// import { getListToolTips, UpdateToolTipsValidation } from '../validations/ToolTipsValidator';

// @Service()
// @JsonController(apiRoute(api.V1, api.SERVICE, component.TOOLTIP, api.ACTION))
// @UseBefore(UserSession,AuthJwt)
// export default class ToolTipsController {
//   constructor(
//     private responseService: ResponseService,
//     private toolTipsService: ToolTipsService
//   ) {}

//   @Authorized([
//     {
//       module: authorizationConstants.MODULE_NAME.BLITZ_MODULE,
//       submodule: authorizationConstants.SUBMODULE.META_MASTER,
//       permission: authorizationConstants.PERMISSION.CAN_ACCESS
//     }
//   ])
//   @Get(action.LIST)
//   public async toolTipsListing(
//     @Req() req: Request,
//     @QueryParams() query: getListToolTips,
//     @Res() res: Response
//   ) {
//     try {
//       const fetchData = await this.toolTipsService.getTooltips(query);
//       return this.responseService.success({
//         res,
//         message: fetchData ? messages.TOOLTIP.LIST_SUCCESS : 'not found',
//         data: fetchData ?? {}
//       });
//     } catch (error) {
//       return this.responseService.serverError({
//         res,
//         error
//       });
//     }
//   }

//   @Authorized([
//     {
//       module: authorizationConstants.MODULE_NAME.BLITZ_MODULE,
//       submodule: authorizationConstants.SUBMODULE.META_MASTER,
//       permission: authorizationConstants.PERMISSION.CAN_ACCESS
//     }
//   ])
//   @Patch(action.UPDATE)
//   public async editToolTip(
//     @Body() tooltips: UpdateToolTipsValidation,
//     @CurrentUser({ required: true }) user: UserJwtPayload,
//     @Res() res: Response
//   ) {
//     try {
//       const tooltipData = await this.toolTipsService.editTooltips(tooltips, user);
//       return this.responseService.success({
//         res,
//         message: messages.TOOLTIP.UPDATE_SUCCESS,
//         data: tooltipData.newData
//       });
//     } catch (error) {
//       return this.responseService.serverError({
//         res,
//         error
//       });
//     }
//   }
// }
