// filepath: server/src/models/index.ts
import { Sequelize, DataTypes, Model } from 'sequelize'; // Add Model import

// Initialize Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log, // Or false in production
});

// Define Student model instance interface
export interface StudentInstance extends Model {
  id: string;
  name: string;
  assignedTeacherId: string | null;
  progressReportGrade: number | null;
  finalReportGrade: number | null;
  finalized: boolean;
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<this>;
}

// Define Teacher model instance interface
export interface TeacherInstance extends Model {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<this>;
}

// Define Student model
const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    assignedTeacherId: {
        type: DataTypes.STRING, // Store Teacher UUID
        allowNull: true,
        references: {         // Optional: Define Foreign Key relationship
            model: 'Teachers', // This is the table name Sequelize generates
            key: 'id',
        }
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
    timestamps: true,
}) as unknown as { // Add type assertion
  findByPk(id: string, options?: any): Promise<StudentInstance | null>; // Update this line to allow options
  findAll(options?: any): Promise<StudentInstance[]>;
  create(data: Partial<StudentInstance>): Promise<StudentInstance>;
};

// Define Teacher model
const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
}) as unknown as { // Add type assertion
  findByPk(id: string, options?: any): Promise<TeacherInstance | null>; // Update this line
  findAll(options?: any): Promise<TeacherInstance[]>;
  findOne(options?: any): Promise<TeacherInstance | null>;
  create(data: Partial<TeacherInstance>): Promise<TeacherInstance>;
};

// Export models and interfaces
export { sequelize, Student, Teacher };