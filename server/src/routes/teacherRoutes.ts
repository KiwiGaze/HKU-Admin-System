import { Router, Request, Response, NextFunction } from 'express';
import { Teacher, TeacherInstance } from '../models/index'; // Import the Teacher model

const router = Router();

// --- Hardcoded User Role Check (Placeholder) ---
// Reuse the same logic as in studentRoutes for consistency during development
const getCurrentUserRole = (req: Request): 'admin' | 'teacher' | null => {
    const roleHeader = req.headers['x-user-role'] as string;
    if (roleHeader === 'admin') return 'admin';
    if (roleHeader === 'teacher') return 'teacher';
    return null;
};
// --- End Hardcoded User Role Check ---


// GET /api/teachers - Get Teacher List (Admin Only)
router.get('/teachers', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const role = getCurrentUserRole(req);

    // Authorization check: Only Admins can get the full teacher list
    if (role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: Only admins can access the teacher list.' });
        return; // Explicitly return void
    }

    try {
        // Fetch all teachers from the database
        const teachers = await Teacher.findAll();
        res.json(teachers); // Send the list as JSON response
    } catch (error) {
        console.error("Error fetching teachers:", error);
        next(error); // Pass errors to the Express error handler
    }
});


export default router; // Export the router