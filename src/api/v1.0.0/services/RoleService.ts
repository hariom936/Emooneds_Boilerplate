import { Service } from 'typedi';
import RolesModel from '../../../models/Roles';
import { UserModel } from '../../../models/Users';
import { ResponseService } from './ResponseService';
import { CreateRole, GetRolesQuery, UserId } from '../validations/RoleValidator';
import { Roles } from '../../../models';
import mongoose from 'mongoose';
import messages from '../../../constants/messages';

@Service()
export class RoleService {
  constructor(private responseService: ResponseService) {}
  /**
   * validateRoleId method is used to check if given role id exists in our system db or not
   * @param {ObjectId} roleId
   * @returns {boolean} true if role exists false if not
   */
  public async validateRoleId(roleId) {
    const exists = await RolesModel.findOne({ _id: roleId });
    return !!exists;
  }

  public async getRoles(opts: GetRolesQuery) {
    const { page = 1, limit = 10 } = opts; // Default values for pagination

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "Users", // Ensure this matches your collection name
          localField: "_id",
          foreignField: "roleId",
          as: "associatedUsers"
        }
      },
      {
        $project: {
          roleName: 1,
          roleId: 1, // Include roleId
          permissions: 1, // Include permissions
          menus: 1, // Include menus
          associatedUsers: { $size: "$associatedUsers" },
          createdAt: 1,
          updatedAt: 1,
          status: 1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const countQuery = await RolesModel.countDocuments(); // Use countDocuments for better performance
    const paginatedQuery = await RolesModel.aggregate(pipeline);

    return {
      count: countQuery,
      records: paginatedQuery
    };
  }


  public async validateRoleNameExists(role: CreateRole) {
    const existingRole = await Roles.findOne({ roleName: role.roleName });
    return existingRole !== null;
  }

  public async createRole(role: CreateRole, userId: UserId) {
    // Check for duplicate roleName
    const existingRole = await RolesModel.findOne({ roleName: role.roleName });
    if (existingRole) {
      // Stop further execution and return the duplicate error message
      return { message: messages.ROLE.ROLE_ALREADY_EXISTS };
    }
  
    // Generate roleId dynamically
    const lastRole = await RolesModel.findOne({}, {}, { sort: { roleId: -1 } }); // Find the last role
    const newRoleId = lastRole ? lastRole.roleId + 1 : 1; // Increment roleId or set to 1 if no roles exist
  
    const newRole = new RolesModel({
      ...role,
      roleId: newRoleId, // Set the generated roleId
      createdBy: new mongoose.Types.ObjectId(userId.userId), // Pass userId as ObjectId
      updatedBy: new mongoose.Types.ObjectId(userId.userId), // Pass userId as ObjectId
    });
  
    const createdRole = await newRole.save();
    return createdRole;
  }
  



  /**
   * editRole method is used to edit role details supplied as input to the api.
   * @param role
   * @param req
   * @returns {boolean} true if role details edited successfully, false if not.
   */
  public async editRole(role, req) {
    const roleId = role.roleId;
    const updatedBy = req.user.userId;

    const filter = { _id: roleId };
    const update = {
      ...req.body,
      updatedBy: updatedBy
    };

    const oldData = await RolesModel.findOne(filter);
    const newData = await RolesModel.findOneAndUpdate(filter, update, { new: true });
    const newUpdatedData = await RolesModel.findOne(filter);
    await UserModel.updateMany(
      { roleId: role.roleId },
      { $set: { session: { isroleUpdate: true } } }
    );
    return { oldData: oldData, newData: newData, newUpdatedData: newUpdatedData };
  }

  /**
   * updateRoleStatus method is used to update role status supplied as input to the api.
   * @param role
   * @param req
   * @returns {boolean} true if role status updated successfully, false if not.
   */
  public async updateRoleStatus(role, req) {
    const roleId = role.roleId;
    const status = role.status;
    const updatedBy = req.user.userId;

    const filter = { _id: roleId };
    const update = {
      status: status,
      updatedBy: updatedBy
    };

    const oldData = await RolesModel.findOne(filter);
    const newData = await RolesModel.findOneAndUpdate(filter, update, { new: true });
    return { oldData: oldData, newData: newData };
  }

  public async getRoleDetails(roleId: string) {
    return RolesModel.findOne({ _id: roleId })
      .select('-__v')
      .populate('createdBy', '-_id userEmail')
      .populate('updatedBy', '-_id userEmail')
      .lean();
  }

  public async deleteRole(roleId: string) {
    const errorMessagesObj = {
      error: false,
      errorData: {
        emooneedsCode: '',
        errorMessage: ''
      }
    };
    const usersWithTheRole = await UserModel.count({ roleId });
    if (usersWithTheRole) {
      errorMessagesObj.error = true;
      errorMessagesObj.errorData = {
        emooneedsCode: 'ROLE_ASSOCIATED_WITH_USERS',
        errorMessage: 'Role is associated with users'
        };
      return errorMessagesObj;
    }
    const deletedRole = await RolesModel.findByIdAndDelete(roleId);
    if (!deletedRole) {
      errorMessagesObj.error = true;
      errorMessagesObj.errorData = {
        emooneedsCode: 'ROLE_ASSOCIATED_WITH_USERS',
        errorMessage: 'Role is associated with users'
        };;
      return errorMessagesObj;
    }
    return {
      ...errorMessagesObj,
      data: deletedRole
    };
  }
}
