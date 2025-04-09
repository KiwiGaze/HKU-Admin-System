// server/src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { sequelize, Teacher } from './models';
import { v4 as uuidv4 } from 'uuid';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import authRoutes from './routes/authRoutes';

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173',
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'X-User-Id'],
}));
app.use(express.json());

// --- API Routes ---
app.use('/', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('HKU Admin System Backend');
});

// --- Initialize Default Teachers ---
async function initializeDefaultTeachers() {
  try {
    // Teacher data matching TEACHER_CREDENTIALS in authRoutes.ts
    const defaultTeachers = [
      { name: 'Professor Smith' },
      { name: 'Dr. Johnson' }
    ];

    // For each default teacher
    for (const teacherData of defaultTeachers) {
      // Check if the teacher already exists
      const existingTeacher = await Teacher.findOne({
        where: { name: teacherData.name }
      });

      // If the teacher doesn't exist, create them
      if (!existingTeacher) {
        await Teacher.create({
          id: uuidv4(), // Generate a UUID
          name: teacherData.name
        });
        console.log(`[server]: Default teacher "${teacherData.name}" created`);
      } else {
        console.log(`[server]: Default teacher "${teacherData.name}" already exists`);
      }
    }

    console.log('[server]: Default teachers initialization complete');
  } catch (error) {
    console.error('[server]: Error initializing default teachers:', error);
  }
}

// --- Database Synchronization and Server Start ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[server]: Connection to database has been established successfully.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("[server]: All models were synchronized successfully.");

    // Initialize default data for demonstration.
    await initializeDefaultTeachers();

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[server]: Unable to start server:', error);
  }
};

startServer();