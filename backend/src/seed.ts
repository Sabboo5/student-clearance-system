import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db';
import User, { IUser } from './models/User';
import ClearanceRequest from './models/ClearanceRequest';
import Notification from './models/Notification';

const DEPARTMENTS = ['Library', 'Finance', 'Dormitory', 'Registrar', 'Laboratory', 'Department Head'];

const seed = async () => {
  await connectDB();
  console.log('Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    ClearanceRequest.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // Create admin
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  });
  console.log('Admin created:', admin.email);

  // Create officers for each department
  const officers: IUser[] = [];
  for (const dept of DEPARTMENTS) {
    const officer = await User.create({
      name: `${dept} Officer`,
      email: `${dept.toLowerCase().replace(/\s+/g, '')}@university.edu`,
      password: 'officer123',
      role: 'officer',
      department: dept,
      isActive: true,
    });
    officers.push(officer);
    console.log('Officer created:', officer.email, '- Department:', dept);
  }

  // Create sample students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await User.create({
      name: `Student ${i}`,
      email: `student${i}@university.edu`,
      password: 'student123',
      role: 'student',
      studentId: `STU-2024-${String(i).padStart(4, '0')}`,
      isActive: true,
    });
    students.push(student);
    console.log('Student created:', student.email);
  }

  // Create sample clearance requests
  const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
  for (let i = 0; i < 3; i++) {
    const student = students[i];
    const departmentClearances = DEPARTMENTS.map((dept, j) => {
      if (statuses[i] === 'pending') {
        // Make some departments approved, some pending
        return {
          department: dept,
          status: j < i * 2 ? 'approved' as const : 'pending' as const,
          officer: j < i * 2 ? officers[j]._id : undefined,
          comment: j < i * 2 ? 'All clear' : undefined,
          reviewedAt: j < i * 2 ? new Date() : undefined,
        };
      }
      return {
        department: dept,
        status: statuses[i],
        officer: officers[j]._id,
        comment: statuses[i] === 'approved' ? 'All clear' : 'Outstanding balance',
        reviewedAt: new Date(),
      };
    });

    await ClearanceRequest.create({
      student: student._id,
      academicYear: '2024/2025',
      reason: 'Graduation clearance',
      departmentClearances,
      overallStatus: statuses[i],
      completedAt: statuses[i] !== 'pending' ? new Date() : undefined,
    });
    console.log(`Clearance request created for ${student.email} - Status: ${statuses[i]}`);
  }

  console.log('\nSeed completed successfully!');
  console.log('\nTest accounts:');
  console.log('Admin: admin@university.edu / admin123');
  console.log('Officer: library@university.edu / officer123');
  console.log('Student: student1@university.edu / student123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
