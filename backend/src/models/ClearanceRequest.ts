import mongoose, { Document, Schema, Types } from 'mongoose';

export type ClearanceStatus = 'pending' | 'approved' | 'rejected';

export interface IDepartmentClearance {
  department: string;
  status: ClearanceStatus;
  officer?: Types.ObjectId;
  comment?: string;
  reviewedAt?: Date;
  documents?: string[];
}

export interface IClearanceRequest extends Document {
  student: Types.ObjectId;
  academicYear: string;
  reason: string;
  departmentClearances: IDepartmentClearance[];
  overallStatus: ClearanceStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const departmentClearanceSchema = new Schema<IDepartmentClearance>(
  {
    department: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    officer: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, trim: true },
    reviewedAt: { type: Date },
    documents: { type: [String], default: [] },
  },
  { _id: false }
);

const clearanceRequestSchema = new Schema<IClearanceRequest>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    departmentClearances: {
      type: [departmentClearanceSchema],
      default: [],
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const ClearanceRequest = mongoose.model<IClearanceRequest>(
  'ClearanceRequest',
  clearanceRequestSchema
);

export default ClearanceRequest;
