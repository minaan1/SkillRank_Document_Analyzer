import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { documentRouter } from './routes/documentRoutes';
import { initializeDatabase } from './database/setup';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/documents', documentRouter);

// Initialize database
initializeDatabase().catch(console.error);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});