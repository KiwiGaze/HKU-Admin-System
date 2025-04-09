// filepath: server/src/models/index.ts
import { Sequelize, DataTypes } from 'sequelize';

// Initialize Sequelize (same configuration as in index.ts)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log, // Or false in production
});

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
});

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
});

// --- Define Associations (Optional but Recommended) ---
// Example: A Teacher can have many Students
Teacher.hasMany(Student, { foreignKey: 'assignedTeacherId' });
// Example: A Student belongs to one Teacher (or null)
Student.belongsTo(Teacher, { foreignKey: 'assignedTeacherId' });
// --- End Associations ---


// Export sequelize instance and models
export { sequelize, Student, Teacher };