import { Router, Request, Response, NextFunction } from 'express';
import { Teacher, TeacherInstance } from '../models/index';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// --- Hardcoded user credentials (only for prototype development) ---
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

// Teacher user credentials associated with Teacher records in the database
const TEACHER_CREDENTIALS = [
  // Each teacher's username, password, and corresponding database record name
  { username: 'teacher1', password: 'pass123', teacherName: 'Professor Smith' },
  { username: 'teacher2', password: 'pass456', teacherName: 'Dr. Johnson' }
];

// POST /login - User login
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    // Check admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      res.status(200).json({ 
        role: ADMIN_CREDENTIALS.role,
        userId: 'admin', // Admin doesn't need an actual ID
        message: 'Login successful'
      });
      return;
    }

    // Check teacher credentials
    const teacherMatch = TEACHER_CREDENTIALS.find(
      t => t.username === username && t.password === password
    );

    if (teacherMatch) {
      // Check if this teacher already exists in the database
      let teacher = await Teacher.findOne({ where: { name: teacherMatch.teacherName } });

      // If teacher doesn't exist in the database, create one
      if (!teacher) {
        teacher = await Teacher.create({
          id: uuidv4(), // Generate unique ID
          name: teacherMatch.teacherName
        });
      }

      res.status(200).json({
        role: 'teacher',
        userId: teacher.id, // Return teacher ID for frontend use
        userName: teacher.name,
        message: 'Login successful'
      });
      return;
    }

    // Invalid credentials
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

export default router;