import { Response } from 'express';
import ClearanceRequest from '../models/ClearanceRequest';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../types';

const DEPARTMENTS = ['Library', 'Finance', 'Dormitory', 'Registrar', 'Laboratory', 'Department Head'];

// POST /api/clearance - Student submits a new clearance request
export const createClearanceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicYear, reason } = req.body;
    if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }

    const existing = await ClearanceRequest.findOne({
      student: req.user._id,
      overallStatus: 'pending',
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'You already have a pending clearance request' });
      return;
    }

    const departmentClearances = DEPARTMENTS.map((dept) => ({
      department: dept,
      status: 'pending' as const,
    }));

    const clearance = await ClearanceRequest.create({
      student: req.user._id,
      academicYear,
      reason,
      departmentClearances,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      resource: 'ClearanceRequest',
      resourceId: clearance._id,
      details: `New clearance request for ${academicYear}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: clearance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create clearance request';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/clearance - Get clearance requests (filtered by role)
export const getClearanceRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query: Record<string, unknown> = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'officer' && req.user.department) {
      query['departmentClearances.department'] = req.user.department;
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      if (req.user.role === 'officer' && req.user.department) {
        query['departmentClearances'] = {
          $elemMatch: { department: req.user.department, status },
        };
        delete query['departmentClearances.department'];
      } else {
        query.overallStatus = status;
      }
    }

    let dbQuery = ClearanceRequest.find(query)
      .populate('student', 'name email studentId')
      .populate('departmentClearances.officer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { academicYear: searchRegex },
        { reason: searchRegex },
      ] as any;
      dbQuery = ClearanceRequest.find(query)
        .populate('student', 'name email studentId')
        .populate('departmentClearances.officer', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const [requests, total] = await Promise.all([
      dbQuery.exec(),
      ClearanceRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clearance requests';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/clearance/:id
export const getClearanceRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }

    const clearance = await ClearanceRequest.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('departmentClearances.officer', 'name email');

    if (!clearance) {
      res.status(404).json({ success: false, message: 'Clearance request not found' });
      return;
    }

    if (
      req.user.role === 'student' &&
      clearance.student._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.json({ success: true, data: clearance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clearance request';
    res.status(500).json({ success: false, message });
  }
};

// PUT /api/clearance/:id/review - Officer reviews a department clearance
export const reviewDepartmentClearance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }

    const { status, comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
      return;
    }

    const clearance = await ClearanceRequest.findById(req.params.id);
    if (!clearance) {
      res.status(404).json({ success: false, message: 'Clearance request not found' });
      return;
    }

    const deptClearance = clearance.departmentClearances.find(
      (dc) => dc.department === req.user!.department
    );
    if (!deptClearance) {
      res.status(403).json({ success: false, message: 'Not authorized for this department' });
      return;
    }

    deptClearance.status = status;
    deptClearance.officer = req.user._id;
    deptClearance.comment = comment || '';
    deptClearance.reviewedAt = new Date();

    // Check if all departments have been reviewed
    const allApproved = clearance.departmentClearances.every((dc) => dc.status === 'approved');
    const anyRejected = clearance.departmentClearances.some((dc) => dc.status === 'rejected');

    if (allApproved) {
      clearance.overallStatus = 'approved';
      clearance.completedAt = new Date();
    } else if (anyRejected) {
      clearance.overallStatus = 'rejected';
      clearance.completedAt = new Date();
    }

    await clearance.save();

    // Create notification for student
    await Notification.create({
      user: clearance.student,
      title: `${req.user.department} Clearance ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: comment
        ? `${req.user.department}: ${comment}`
        : `Your ${req.user.department} clearance has been ${status}.`,
      type: status === 'approved' ? 'success' : 'error',
      link: `/clearance/${clearance._id}`,
    });

    if (clearance.overallStatus !== 'pending') {
      await Notification.create({
        user: clearance.student,
        title: `Overall Clearance ${clearance.overallStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your clearance request has been ${clearance.overallStatus}.`,
        type: clearance.overallStatus === 'approved' ? 'success' : 'error',
        link: `/clearance/${clearance._id}`,
      });
    }

    await AuditLog.create({
      user: req.user._id,
      action: 'REVIEW',
      resource: 'ClearanceRequest',
      resourceId: clearance._id,
      details: `${req.user.department} clearance ${status}${comment ? ': ' + comment : ''}`,
      ipAddress: req.ip,
    });

    const updated = await ClearanceRequest.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('departmentClearances.officer', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to review clearance';
    res.status(500).json({ success: false, message });
  }
};

// POST /api/clearance/:id/upload - Upload document for a clearance
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const { department } = req.body;
    const clearance = await ClearanceRequest.findById(req.params.id);
    if (!clearance) {
      res.status(404).json({ success: false, message: 'Clearance request not found' });
      return;
    }

    if (req.user.role === 'student' && clearance.student.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const deptClearance = clearance.departmentClearances.find(
      (dc) => dc.department === department
    );
    if (!deptClearance) {
      res.status(400).json({ success: false, message: 'Invalid department' });
      return;
    }

    if (!deptClearance.documents) deptClearance.documents = [];
    deptClearance.documents.push(req.file.filename);
    await clearance.save();

    res.json({ success: true, message: 'Document uploaded', filename: req.file.filename });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload document';
    res.status(500).json({ success: false, message });
  }
};
