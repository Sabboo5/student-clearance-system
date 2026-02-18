import { Response } from 'express';
import User from '../models/User';
import ClearanceRequest from '../models/ClearanceRequest';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../types';

// GET /api/admin/users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    res.status(500).json({ success: false, message });
  }
};

// PUT /api/admin/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, department, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'UPDATE',
        resource: 'User',
        resourceId: user._id,
        details: `Updated user: role=${role}, department=${department}, isActive=${isActive}`,
        ipAddress: req.ip,
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    res.status(500).json({ success: false, message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: 'DELETE',
        resource: 'User',
        resourceId: user._id,
        details: `Deleted user: ${user.email}`,
        ipAddress: req.ip,
      });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalOfficers,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      departmentStats,
      recentRequests,
      monthlyStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'officer' }),
      ClearanceRequest.countDocuments(),
      ClearanceRequest.countDocuments({ overallStatus: 'pending' }),
      ClearanceRequest.countDocuments({ overallStatus: 'approved' }),
      ClearanceRequest.countDocuments({ overallStatus: 'rejected' }),
      ClearanceRequest.aggregate([
        { $unwind: '$departmentClearances' },
        {
          $group: {
            _id: {
              department: '$departmentClearances.department',
              status: '$departmentClearances.status',
            },
            count: { $sum: 1 },
          },
        },
      ]),
      ClearanceRequest.find()
        .populate('student', 'name email studentId')
        .sort({ createdAt: -1 })
        .limit(5),
      ClearanceRequest.aggregate([
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$overallStatus', 'approved'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$overallStatus', 'rejected'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),
    ]);

    // Transform department stats
    const deptMap: Record<string, Record<string, number>> = {};
    for (const stat of departmentStats) {
      const dept = stat._id.department;
      if (!deptMap[dept]) deptMap[dept] = { pending: 0, approved: 0, rejected: 0 };
      deptMap[dept][stat._id.status] = stat.count;
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalOfficers,
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
        },
        departmentStats: deptMap,
        recentRequests,
        monthlyStats,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/admin/audit-logs
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.action) query.action = req.query.action;
    if (req.query.resource) query.resource = req.query.resource;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch audit logs';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/admin/reports
export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, type } = req.query;

    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const query: Record<string, unknown> = {};
    if (Object.keys(dateFilter).length > 0) query.createdAt = dateFilter;

    if (type === 'summary') {
      const [total, approved, rejected, pending, byDepartment] = await Promise.all([
        ClearanceRequest.countDocuments(query),
        ClearanceRequest.countDocuments({ ...query, overallStatus: 'approved' }),
        ClearanceRequest.countDocuments({ ...query, overallStatus: 'rejected' }),
        ClearanceRequest.countDocuments({ ...query, overallStatus: 'pending' }),
        ClearanceRequest.aggregate([
          { $match: query },
          { $unwind: '$departmentClearances' },
          {
            $group: {
              _id: '$departmentClearances.department',
              total: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ['$departmentClearances.status', 'approved'] }, 1, 0] } },
              rejected: { $sum: { $cond: [{ $eq: ['$departmentClearances.status', 'rejected'] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ['$departmentClearances.status', 'pending'] }, 1, 0] } },
            },
          },
        ]),
      ]);

      res.json({
        success: true,
        data: { total, approved, rejected, pending, byDepartment },
      });
    } else {
      // Detailed report - return all matching requests
      const requests = await ClearanceRequest.find(query)
        .populate('student', 'name email studentId')
        .populate('departmentClearances.officer', 'name email')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: requests });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    res.status(500).json({ success: false, message });
  }
};
