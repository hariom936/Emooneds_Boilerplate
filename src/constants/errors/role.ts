export const role = {
  ADD_ROLE_ERROR: {
    errorMessage: 'Role insert failed try again.',
    emooneedsCode: 'EMOONEEDS_02001'
  },
  UPDATE_ROLE_ERROR: {
    errorMessage: 'Role update failed try again.',
    emooneedsCode: 'EMOONEEDS_02002'
  },
  DELETE_ROLE_ERROR: {
    errorMessage: 'Role delete failed try again.',
    emooneedsCode: 'EMOONEEDS_02003'
  },
  LIST_ROLE_ERROR: {
    errorMessage: 'Role get list failed try again.',
    emooneedsCode: 'EMOONEEDS_02004'
  },
  DETAIL_ROLE_ERROR: {
    errorMessage: 'Role fetch detail failed try again.',
    emooneedsCode: 'EMOONEEDS_02005'
  },
  STATUS_ROLE_ERROR: {
    errorMessage: 'Role status update failed try again.',
    emooneedsCode: 'EMOONEEDS_02006'
  },
  INVALID_ROLE_ID: {
    errorMessage: 'Invalid Role Or Role Does Not Exists in Our System',
    emooneedsCode: 'EMOONEEDS_02011'
  },
  DUPLICATE_ROLE_NAME: {
    errorMessage: 'This role name already exist.',
    emooneedsCode: 'EMOONEEDS_02012'
  },
  ROLE_HAS_USERS: {
    errorMessage: 'Cannot delete this role as it has user(s) associated with it',
    emooneedsCode: 'EMOONEEDS_02013'
  },
  INVALID_ID_CANNOT_DELETE: {
    errorMessage: 'Invalid role id. No data was deleted',
    emooneedsCode: 'EMOONEEDS_02014'
  },
  INACTIVATE_ROLE_ERROR: {
    errorMessage: `Role deactivation is blocked due to associated users with this role; visit 'Associated User' in 'Quick Links' to unmap users or assign new role in the 'User Management' section before proceeding with deactivation.`,
    emooneedsCode: 'EMOONEEDS_02015'
  },
  INVALID_DATA: {
    errorMessage: 'Invalid data, please check your request',
    emooneedsCode: 'EMOONEEDS_02016'
  }
};
