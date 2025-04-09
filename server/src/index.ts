// server/src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize'; // Import Sequelize

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// --- Sequelize Setup ---
// Initialize Sequelize with SQLite
// This will create a 'database.sqlite' file in the 'server' directory
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Path to the database file
  logging: console.log, // Log SQL queries (optional, good for debugging)
});

// --- Define Models ---
// Match the structure from your design document
const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID, // Use UUID if you plan to use uuid library
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assignedTeacherId: {
    type: DataTypes.STRING, // Assuming teacher IDs are strings (like UUIDs)
    allowNull: true,
  },
  progressReportGrade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  finalReportGrade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  finalized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Define the Teacher model
const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID, // Use UUID for consistency
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  // Model options
  timestamps: true, // Adds createdAt and updatedAt fields
});

// --- End Sequelize Setup ---

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the HKU-Admin-System backend API!' });
});

app.post('/api/data', (req: Request, res: Response) => {
    console.log('Received data:', req.body);
    res.json({ received: req.body, message: 'Data received' });
});

// --- Database Synchronization and Server Start ---
const startServer = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('[server]: Connection to database has been established successfully.');

    // Sync all defined models to the DB.
    // { force: true } will drop tables if they already exist - use with caution!
    // { alter: true } attempts to alter existing tables (safer for development)
    await sequelize.sync({ alter: true });
    console.log("[server]: All models were synchronized successfully.");

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[server]: Unable to connect to the database or sync models:', error);
  }
};

startServer();
// --- End Database Synchronization ---