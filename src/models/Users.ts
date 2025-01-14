import mongoose from 'mongoose';
import databaseConstants from '../constants/databaseConstants';
import { dbStatus } from '../types/customDatabaseTypes';

interface IUser {
  type: string;
  userId?: number;
  roleId?: number; // roleId is a number
  userEmail: string;
  firstName: string;
  lastName?: string; // Optional lastName
  userName: string;
  status: dbStatus;
  token: string | null;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    userId: { 
      type: Number,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: false
    },
    userEmail: {
      type: String,
      required: true,
      unique: true
    },
    roleId: {
      ref: 'Roles',
      type: Number,
      required: false
    },
    token: { type: String, default: null },
    status: {
      type: String,
      enum: databaseConstants.databaseEnums,
      required: true,
      default: dbStatus.ACTIVE
    }
  },
  { timestamps: true }
);

// Middleware to convert email to lowercase before saving
userSchema.pre('save', function (next) {
  if (this.isModified('userEmail')) {
    this.userEmail = this.userEmail.toLowerCase();
  }
  next();
});

const UserModel = mongoose.model<IUser>('Users', userSchema);
export { IUser, UserModel };
