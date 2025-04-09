//server/src/routes/studentRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Student, Teacher } from '../models/index';
import { Op } from 'sequelize';

const router = Router();

// --- Hardcoded User Roles ---
const getCurrentUserRole = (req: Request): 'admin' | 'teacher' | null => {
    const roleHeader = req.headers['x-user-role'] as string;
    if (roleHeader === 'admin') return 'admin';
    if (roleHeader === 'teacher') return 'teacher';
    return null;
};

const getCurrentUserId = (req: Request): string | null => {
    const userIdHeader = req.headers['x-user-id'] as string;
    return userIdHeader || null;
}
// --- End Hardcoded User Roles ---


// GET /api/students - Explicitly type return as Promise<void>
router.get('/students', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    const userId = getCurrentUserId(req);

    try {
        let students;
        if (role === 'admin') {
            students = await Student.findAll({ include: [Teacher] });
        } else if (role === 'teacher' && userId) {
            students = await Student.findAll({
                where: { assignedTeacherId: userId },
                include: [Teacher]
            });
        } else {
            // Send response and return to avoid further execution
            res.status(403).json({ message: 'Forbidden: Access denied or missing user ID.' });
            return; // Explicitly return void
        }
        // Send response and implicitly return void
        res.json(students);
        return;
    } catch (error) {
        console.error("Error fetching students:", error);
        next(error); // Pass error to handler
    }
});

// POST /api/students - Explicitly type return as Promise<void>
router.post('/students', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can add students.' });
        return;
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string') {
        res.status(400).json({ message: 'Bad Request: Student name is required.' });
        return;
    }

    try {
        const newStudent = await Student.create({ name: name });
        // Send response and implicitly return void
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Error adding student:", error);
        next(error); // Pass error to handler
    }
});


// --- Placeholder for other student routes ---
// ...
// --- End Placeholder ---


export default router;