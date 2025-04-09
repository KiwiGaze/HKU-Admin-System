// server/src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { sequelize } from './models'; // Import sequelize instance from models
import studentRoutes from './routes/studentRoutes'; // Import student routes
import teacherRoutes from './routes/teacherRoutes'; // Import teacher routes
// import authRoutes from './routes/authRoutes'; // Import auth routes later

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend origin
  // Allow custom headers for testing roles (REMOVE IN PRODUCTION)
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'X-User-Id'],
}));
app.use(express.json()); // Parse JSON bodies

// --- API Routes ---
// Mount the student and teacher routes under the /api path
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);
// app.use('/api', authRoutes);

// Simple root path response
app.get('/', (req: Request, res: Response) => {
  res.send('HKU Admin System Backend');
});

// --- Database Synchronization and Server Start ---
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[server]: Connection to database has been established successfully.');

    // Sync models (using the imported sequelize instance)
    await sequelize.sync({ alter: true });
    console.log("[server]: All models were synchronized successfully.");

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[server]: Unable to start server:', error);
  }
};

startServer();