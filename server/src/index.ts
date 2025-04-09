// server/src/index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors'; // Import cors

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configure CORS
// Simple configuration allows all origins, suitable for development.
// Stricter configuration is needed for production.
app.use(cors({
  origin: 'http://localhost:5173' // Only allow your frontend origin to access
}));

// Parse JSON request bodies if your API needs to receive JSON data for POST/PUT requests.
app.use(express.json());

/**
 * GET /api
 * Returns a welcome message for the API.
 */
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the HKU-Admin-System backend API!' });
});

/**
 * POST /api/data
 * Receives data in the request body, logs it, and sends it back.
 */
app.post('/api/data', (req: Request, res: Response) => {
    console.log('Received data:', req.body);
    res.json({ received: req.body, message: 'Data received' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});