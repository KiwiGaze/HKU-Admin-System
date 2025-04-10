//server/src/routes/studentRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Student, StudentInstance, Teacher, TeacherInstance } from '../models/index';
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


// GET /api/students - Get Student List (Admin/Teacher)
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
            res.status(403).json({ message: 'Forbidden: Access denied or missing user ID.' });
            return;
        }
        res.json(students);
        return;
    } catch (error) {
        console.error("Error fetching students:", error);
        next(error);
    }
});

// POST /api/students - Add New Student (Admin)
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
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Error adding student:", error);
        next(error);
    }
});

// PUT /api/students/:id/assign - Assign Teacher (Admin)
router.put('/students/:id/assign', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can assign teachers.' });
        return;
    }

    const studentId = req.params.id;
    const { teacherId } = req.body;

    if (!teacherId || typeof teacherId !== 'string') {
        res.status(400).json({ message: 'Bad Request: Teacher ID is required.' });
        return;
    }

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }

        if (student.finalized) {
            res.status(409).json({ message: 'Conflict: Cannot modify a finalized record.' });
            return;
        }

        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found.' });
            return;
        }

        student.assignedTeacherId = teacherId;
        await student.save();

        const updatedStudent = await Student.findByPk(studentId, { include: [Teacher] });
        res.json(updatedStudent);
    } catch (error) {
        console.error("Error assigning teacher:", error);
        next(error);
    }
});

// Put /api/students/:id/unassign - Unassign Teacher (Admin)
router.put('/students/:id/unassign', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can unassign teachers.' });
        return;
    }

    const studentId = req.params.id;

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }

        if (student.finalized) {
            res.status(409).json({ message: 'Conflict: Cannot modify a finalized record.' });
            return;
        }

        student.assignedTeacherId = null;
        await student.save();

        const updatedStudent = await Student.findByPk(studentId, { include: [Teacher] });
        res.json(updatedStudent);
    } catch (error) {
        console.error("Error unassigning teacher:", error);
        next(error);
    }
});

// PUT /api/students/:id/grade - Grade Student (Teacher)
router.put('/students/:id/grade', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    const userId = getCurrentUserId(req);
    
    if (role !== 'teacher' || !userId) {
        res.status(403).json({ message: 'Forbidden: Only teachers can grade students.' });
        return;
    }

    const studentId = req.params.id;
    const { reportType, grade } = req.body;

    if (!reportType || !['progress', 'final'].includes(reportType)) {
        res.status(400).json({ message: 'Bad Request: Valid reportType (progress or final) is required.' });
        return;
    }

    if (typeof grade !== 'number' || grade < 0 || grade > 100) {
        res.status(400).json({ message: 'Bad Request: Grade must be a number between 0 and 100.' });
        return;
    }

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }

        if (student.assignedTeacherId !== userId) {
            res.status(403).json({ message: 'Forbidden: You are not assigned to this student.' });
            return;
        }

        if (student.finalized) {
            res.status(409).json({ message: 'Conflict: Cannot modify a finalized record.' });
            return;
        }

        if (reportType === 'progress') {
            student.progressReportGrade = grade;
        } else {
            student.finalReportGrade = grade;
        }

        await student.save();

        res.json(student);
    } catch (error) {
        console.error("Error grading student:", error);
        next(error);
    }
});

// PUT /api/students/:id/finalize - Finalize Student Record (Teacher)
router.put('/students/:id/finalize', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    const userId = getCurrentUserId(req);
    
    if (role !== 'teacher' || !userId) {
        res.status(403).json({ message: 'Forbidden: Only teachers can finalize student records.' });
        return;
    }

    const studentId = req.params.id;

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }

        if (student.assignedTeacherId !== userId) {
            res.status(403).json({ message: 'Forbidden: You are not assigned to this student.' });
            return;
        }

        if (student.finalized) {
            res.status(409).json({ message: 'Conflict: Record is already finalized.' });
            return;
        }

        if (student.finalReportGrade === null) {
            res.status(409).json({ message: 'Conflict: Final report grade must be entered before finalizing.' });
            return;
        }

        student.finalized = true;
        await student.save();

        res.json(student);
    } catch (error) {
        console.error("Error finalizing student record:", error);
        next(error);
    }
});

// PUT /api/students/:id/unfinalize - Unfinalize Student Record (Admin)
router.put('/students/:id/unfinalize', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can unfinalize student records.' });
        return;
    }
    const studentId = req.params.id;
    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }
        if (!student.finalized) {
            res.status(409).json({ message: 'Conflict: Record is not finalized.' });
            return;
        }
        student.finalized = false;
        await student.save();
        res.json(student);
    } catch (error) {
        console.error("Error unfinalizing student record:", error);
        next(error);
    }
});

// DELETE /api/students/:id - Delete Student (Admin)
router.delete('/students/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can delete students.' });
        return;
    }

    const studentId = req.params.id;

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }

        if (student.finalized) {
            res.status(409).json({ message: 'Conflict: Cannot delete a finalized record.' });
            return;
        }

        await student.destroy();
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting student:", error);
        next(error);
    }
});

// GET /api/students/search - Search Students (Admin/Teacher)
router.get('/students/search', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);
    const userId = getCurrentUserId(req);
    const searchName = typeof req.query.name === 'string' ? req.query.name : '';

    if (role !== 'admin' && role !== 'teacher') {
        res.status(403).json({ message: 'Forbidden: Access denied.' });
        return;
    }

    try {
        let students: StudentInstance[] = [];
        
        if (role === 'admin') {
            students = await Student.findAll({
                where: {
                    name: {
                        [Op.like]: `%${searchName}%`
                    }
                },
                include: [Teacher]
            });
        } else if (role === 'teacher' && userId) {
            students = await Student.findAll({
                where: {
                    assignedTeacherId: userId,
                    name: {
                        [Op.like]: `%${searchName}%`
                    }
                },
                include: [Teacher]
            });
        }

        res.json(students || []);
    } catch (error) {
        console.error("Error searching students:", error);
        next(error);
    }
});

export default router;