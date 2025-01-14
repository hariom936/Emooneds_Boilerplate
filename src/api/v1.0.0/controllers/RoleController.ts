/**
 * @author: Sunil
 * @file: src/api/v1.0.0/controllers/RoleController.ts
 * @description: RoleController.ts will be used for Role related methods like creation, deletion,
 * updation , listing etc of Role/Roles. It uses JWT for authentication.
 */
import { Service } from 'typedi';
import { apiRoute } from '../../../utils/apiSemver';
import { versions as api, component, action } from '../../../constants/api';
import { ResponseService } from '../services/ResponseService';
import { RoleService } from '../services/RoleService';
import messages from '../../../constants/messages';
import {
  GetRolesQuery,
  CreateRole,
  // EditRole,
  UserId
} from '../validations/RoleValidator';
import { AuthJwt } from '../../../middlewares/AuthJwt';
import {
  JsonController,
  Post,
  Body,
  UseBefore,
  Req,
  Res,
  QueryParams,
  Get,
} from 'routing-controllers';

import { Request, Response } from 'express';
import { UserModel } from '../../../models/Users';
import RolesModel from '../../../models/Roles';



@Service()
@JsonController(apiRoute(api.V1, component.ROLE)) // v1/service/userRole/action
@UseBefore(AuthJwt)
export default class RoleController {
  constructor(
    private roleService: RoleService,
    private responseService: ResponseService,
  ) {}

  //Get Role Listing
  @UseBefore(AuthJwt)
  @Get(action.LIST)
  public async getRoleListing(
    @Req() req: Request,
    @QueryParams() query: GetRolesQuery,
    @Res() res: Response
  ) {
    try {
      const data = await this.roleService.getRoles(query);
      return this.responseService.success({
        res,
        message: "Data fetched successfully.",
        data,
      });
    } catch (error) {
      return this.responseService.serverError({
        res,
        error,
      });
    }
  }

  @Post(action.ADD)
public async createRole(@Req() req: Request, @QueryParams() userId: UserId, @Body() role: CreateRole, @Res() res: Response) {
  try {
    // Validate userId is a valid number
    if (!userId.userId || userId.userId < 1) {
      return this.responseService.failure({ res, message: 'Invalid user ID' });
    }

    // Check if the user exists
    const userExists = await UserModel.findOne({ userId: userId.userId });
    if (!userExists) {
      return this.responseService.failure({ res, message: 'User ID does not exist' });
    }

    // Check for duplicate roleName
    const existingRole = await RolesModel.findOne({ roleName: role.roleName });
    if (existingRole) {
      // Return failure if roleName is already in use
      return this.responseService.failure({
        res,
        message: 'Role name already exists', // Error message for duplicate roleName
      });
    }

    // Call the service with the role and userId
    const createdRole = await this.roleService.createRole(role, userId); // Pass userId here

    return this.responseService.success({
      res,
      message: messages.ROLE.ROLE_ADD_SUCCESS,
      data: createdRole,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return this.responseService.serverError({ res, error });
  }
}

 
}

