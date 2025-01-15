/**
 * @author: Hariom Verma
 * @file: src/api/v1.0.0/controllers/UserController.ts
 * @description: UserController.ts will be used for User related methods like creation, deletion,
 * updation , listing etc of User/Users. It uses JWT for authentication.
 */

import {
  JsonController,
  Get,
  Post,
  Body,
  // UseBefore,
  Req,
  Res,
  Patch,
  QueryParams,
  Delete,
  UseBefore
} from 'routing-controllers';
import { Service } from 'typedi';
import { UserService } from '../services/UserService';
import { CreateUser, EditUser, LoginUser, UserListing } from '../validations/UserValidator';
import messages from '../../../constants/messages';
import { apiRoute } from '../../../utils/apiSemver';
import { versions as api, component, action } from '../../../constants/api';
import { ResponseService } from '../services/ResponseService';
import { Request, Response } from 'express';
import { AuthJwt } from '../../../middlewares/AuthJwt';
import { ApiError } from '../../../utils/ApiError';
// import { UserSession } from '../../../middlewares/UserSession';


@Service()
@JsonController(apiRoute(api.V1,component.USER)) // v1/user
// @UseBefore(UserSession,AuthJwt)

export default class UserController {
  constructor(
    private userService: UserService,
    private responseService: ResponseService,
  ) {}

  //Login User

  @Post(action.LOGIN)
  public async loginUser(
  @Req() req: Request,
  @Body({ validate: true }) user: LoginUser,
  @Res() res: Response
) {
  try {
    const result = await this.userService.loginUser(user);
    return this.responseService.success({
      res,
      message: messages.USER.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);
    return this.responseService.failure({
      res,
      message: error instanceof ApiError ? error.message : messages.USER.LOGIN_FAILED,
    });
  }
}


  //User Add
  @Post(action.ADD)
public async createUser(
  @Req() req: Request,
  @Body({ validate: true }) user: CreateUser,
  @Res() res: Response
) {
  console.log('Received user data:', user); // Log the received user data
  try {
    const createdUser = await this.userService.createUser(user);
    return this.responseService.success({
      res,
      message: messages.USER.ADD_USER_SUCCESS,
      data: createdUser, // Send the full user object in the response
    });
  } catch (error) {
    console.error('User creation error:', error); // Log error for debugging
    return this.responseService.failure({
      res,
      message: error instanceof Error ? error.message : messages.USER.ADD_USER_FAILED,
    });
  }
}



   //User Listing
  //  @UseBefore(AuthJwt)
  @Get(action.LIST)
  public async userListing(
     @Req() req: Request,
     @QueryParams() query: UserListing,
     @Res() res: Response
   ) {
     try {
       const fetchData = await this.userService.fetchData(query);
       if (fetchData) {
         return this.responseService.success({
           res,
           message: messages.SUCCESS,
           data: fetchData
         });
       } else {
         return this.responseService.noDataFound({
           res,
           message: messages.NOT_FOUND
         });
       }
     } catch (error) {
       return this.responseService.serverError({
         res,
         error
       });
     }
  }

  //User Edit
  @Patch(action.UPDATE)
  public async editUser(
    @Req() req: Request,
    @QueryParams() query: { userId: string },  // Accepting only userId in query parameters
    @Body({ validate: true }) user: EditUser,  // The body contains only user details (excluding userId)
    @Res() res: Response
  ) {
    try {
      // Validate if the provided userId exists
      const isValidUserId = await this.userService.checkValidUserId(query.userId);
      if (!isValidUserId) {
        return this.responseService.validationError({
          res,
          message: 'Invalid User Id',
        });
      }

      // Proceed with editing the user details
      const editUserResult = await this.userService.editUser({ ...user, userId: query.userId });
      if (editUserResult.updatedData) {
        return this.responseService.success({
          res,
          message: messages.USER.USER_UPDATE_SUCCESS,
          data: editUserResult.updatedData,
        });
      } else {
        return this.responseService.failure({
          res,
          message: messages.USER.USER_UPDATE_FAILED,
        });
      }
    } catch (error) {
      return this.responseService.serverError({
        res,
        error,
      });
    }
  }

  //User Delete
  @Delete(action.DELETE)
  public async deleteUser(
    @Req() req: Request,
    @QueryParams() query: { userId: string },  // Accepting only userId in query parameters
    @Res() res: Response
  ) {
    try {
      // Validate if the provided userId exists
      const isValidUserId = await this.userService.checkValidUserId(query.userId);
      if (!isValidUserId) {
        return this.responseService.validationError({
          res,
          message: 'Invalid User Id',
        });
      }

      // Proceed with deleting the user
      const deleteResult = await this.userService.deleteUser(query.userId);
      if (deleteResult) {
        return this.responseService.success({
          res,
          message: messages.USER.USER_DELETE_SUCCESS,
        });
      } else {
        return this.responseService.failure({
          res,
          message: messages.USER.USER_DELETE_FAILED,
        });
      }
    } catch (error) {
      return this.responseService.serverError({
        res,
        error,
      });
    }
  }



  
}
