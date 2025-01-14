/**
 * @author: Hariom  Verma
 * @file: src/api/v1.0.0/services/UserService.ts
 * @description: User Service is used as a service for exposing user related methods for primarily
 * UserController. User Service interacts with Database for user related CRUD operations.
 */

import { Service } from 'typedi';
import { UserModel } from '../../../models/Users';
import httpStatus from 'http-status';
// import { generateJwtToken } from '../../../utils/token';
// import config from '../../../config/config';
import apiConfigs from '../../../config/apiConfigs';
// import errorMessages from '../../../constants/errorMessages';
// import { collectionNames } from '../../../constants/databaseConstants';
import axios from 'axios';
import { CreateUser, EditUser, LoginUser } from '../validations/UserValidator';
import { sign } from 'jsonwebtoken';
import config from '../../../config/config';
import RolesModel from '../../../models/Roles';
import { ApiError } from '../../../utils/ApiError';
@Service()
export class UserService {

 /**
   * loginUser method is used to login user and return JWT token.
   * @param user
   * @returns {Object} user details along with token
   */
//  public async loginUser(user) {
//   try {
//     const loginUser = await UserModel.findOne({ 
//       userId: user.userId,
//       userName: user.userName, 
//       userEmail: user.userEmail 
//     });

//     if (!loginUser) {
//       throw new Error('User not found');
//     }

//     // let token = loginUser.token;
//     // if (!token) {
//     //   token = sign(
//     //     { 
//     //       userId: loginUser._id, 
//     //       userName: loginUser.userName, 
//     //       userEmail: loginUser.userEmail
//     //     }, 
//     //     config.jwt.secret, 
//     //     { 
//     //       expiresIn: config.jwt.accessExpirationMinutes,
//     //       noTimestamp: true
//     //     }
//     //   );

//     //   loginUser.token = token;
//     //   await loginUser.save();
//     // }

//     return {
//       user: loginUser,
//       // token
//     };
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     throw new Error('Error logging in user: ');
//   }
// }
public async loginUser(user: LoginUser) {
  try {
      // Log the user input for debugging
      console.log('User input for login:', user);

      // Validate user input
      if (!user.userName || !user.userEmail) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields');
      }

      const loginUser = await UserModel.findOne({
          userName: user.userName,
          userEmail: user.userEmail,
      });

      if (!loginUser) {
          throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }

      // Generate token
      

      return {
          user: loginUser,
      };
  } catch (error) {
      console.error('Error logging in user:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error logging in user');
  }
}

  /**
   * Create a new user in system database
   * @param {Object} user
   * @param {Object} req - The request object to get user information (if authenticated)
   * @returns {Promise<Object>} The created user object if successful
   * @throws {Error} If the user creation fails
   */
  public async createUser(userData: CreateUser) {
    try {
        // Check if userEmail or userName already exists in the database
        const existingUser = await UserModel.findOne({
            $or: [
                { userEmail: userData.userEmail },
                { userName: userData.userName }
            ]
        });

        // If a user is found with the same userEmail or userName, throw an error
        if (existingUser) {
            let duplicateField = '';
            if (existingUser.userEmail === userData.userEmail) {
                duplicateField = 'userEmail';
            } else if (existingUser.userName === userData.userName) {
                duplicateField = 'userName';
            }
            // Throw a detailed error
            throw new Error(`Duplicate ${duplicateField} detected. Please use a different ${duplicateField}.`);
        }

        // Ensure roleId is provided and corresponds to a single role
        if (!userData.roleId) {
            throw new Error('Invalid roleId. Please provide a single roleId.');
        }

        // Check if the role exists in the database
        const roleExists = await RolesModel.findOne({ roleId: userData.roleId });
        if (!roleExists) {
            throw new Error('Role does not exist. Please provide a valid roleId.');
        }

        // Generate userId if not provided
        if (!userData.userId) {
            const lastUser = await UserModel.findOne({}, {}, { sort: { userId: -1 } }); // Find the last user
            userData.userId = (lastUser && lastUser.userId !== undefined) ? lastUser.userId + 1 : 1; // Increment userId or set to 1 if no users exist
        }

        // Proceed with user creation if no duplicates are found
        const newUser = new UserModel({
            ...userData,
            roleId: userData.roleId // Ensure roleId is included
        });

        await newUser.save();

        // Construct the returned user object
        const returnedUser = {
            userId: newUser.userId,
            userEmail: newUser.userEmail,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            userName: newUser.userName,
            role: {
                roleId: newUser.roleId,
                roleName: roleExists ? roleExists.roleName : null // Include role name or null if not found
            },
            status: newUser.status,
            token: '' // No token generated here
        };

        // Return the constructed user object
        return returnedUser;

    } catch (error) {
        console.error('Error creating user:', error);

        // Return a failure message with more details for debugging
        if (error instanceof Error) {
            throw new Error(`Error creating user: ${error.message}`);
        } else {
            throw new Error('Error creating user: An unknown error occurred');
        }
    }
}



  /**
   * This endpoint acts as a service to logout user via cyberark
   * @param logoutEndpoint
   * @param accessToken
   * @param refreshToken
   * @returns {boolean} true or false.
   */
  public async logoutUser(
    logoutEndpoint,
    accessToken: string,
    refreshToken: string,
    userId: string
  ) {
    const response = await axios.post(logoutEndpoint, {
      token: accessToken,
      refresh_token: refreshToken,
      id_token_hint: accessToken
    });
    await UserModel.findByIdAndUpdate(userId, { session: null });
    return response.status === httpStatus.OK ? true : false;
  }
  /**
   * editUser method is used to edit user details supplied as input to the api.
   * @param user
   * @param req
   * @returns {boolean} true if user details edited successfully, false if not.
   */
  public async editUser(user: EditUser & { userId: string }) {
    const userId = user.userId;
    const filter = { _id: userId };
    const update = {
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      userEmail: user.userEmail,
    };
  
    const oldUserData = await UserModel.findOne(filter);
    const updatedData = await UserModel.findOneAndUpdate(filter, update, { new: true }).lean();
  
    return { oldUserData, updatedData };
  }

  /**
   * checkValidUserId method checks if user id exists in system or not.
   * @param userId
   * @returns {boolean} true if exists false if not
   */
  public async checkValidUserId(userId: string): Promise<boolean> {
    const validateUser = await this.findOneUser(userId); // Pass the userId directly
    return !!validateUser; // Return true if user exists, false otherwise
  }
  

  /**
   * findOneUser method finds a user by it's id in system
   * @param userId
   * @returns {Object} user details
   */
  public async findOneUser(userId: string) {
    return UserModel.findOne({ _id: userId });
  }

  /**
   * fetchData method is used to fetch user data by applying filter and sorting from user collection
   * @param {Object} query
   * @returns {Array} userData , userData returned will always be array of objects
   */
  public async fetchData(query) {
    const apiSearchFilterConditions = apiConfigs.apiSearchFilterConditions;
    const page = query?.page ? query.page : apiSearchFilterConditions.defaultPageNum;
    const limit = query?.limit ? query.limit : apiSearchFilterConditions.defaultLimit;
    const skip = (page - 1) * limit;

    const { roleName } = query; // Assume the roleName is passed in the query

    // Step 1: Find roleId by roleName
    let roleId: number | undefined;
    if (roleName) {
        const role = await RolesModel.findOne({ roleName }).select('roleId');
        roleId = role ? role.roleId : undefined; // Get roleId or undefined if not found
    }

    // Step 2: Build query condition based on roleId
    const queryCondition = roleId ? { roleId } : {}; // If roleId exists, filter by it

    // Aggregation Pipeline
    const pipeline = [
        { $match: queryCondition }, // Match the query condition
        {
            $lookup: {
                from: 'Roles', // The collection to join with
                localField: 'roleId',
                foreignField: 'roleId',
                as: 'roleInfo' // Changed to 'roleInfo' for clarity
            }
        },
        {
            $unwind: {
                path: '$roleInfo',
                preserveNullAndEmptyArrays: true // To keep users without roles
            }
        },
        {
            $project: {
                _id: 1,
                userId: 1,
                firstName: 1,
                lastName: 1,
                userName: 1,
                userEmail: 1,
                token: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                role: { // Structure the role object as desired
                    roleId: '$roleInfo.roleId',
                    roleName: '$roleInfo.roleName'
                }
            }
        },
        {
            $skip: skip // Pagination
        },
        {
            $limit: limit // Pagination
        }
    ];

    // Count the total number of users matching the query
    const countQuery = await UserModel.countDocuments(queryCondition);

    // Fetch the users with the aggregation pipeline
    const records = await UserModel.aggregate(pipeline);
    console.log(records);

    return {
        count: countQuery,
        records
    };
}


  public async deleteUser(userId: string) {
    try {
      const deleteResult = await UserModel.deleteOne({ _id: userId });
      return deleteResult.deletedCount > 0;  // Returns true if a user was deleted
    } catch (error) {
      throw error;
    }
  }
  
}