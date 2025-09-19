"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const documentRoutes_1 = require("./routes/documentRoutes");
const setup_1 = require("./database/setup");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.use('/api/documents', documentRoutes_1.documentRouter);
// Initialize database
(0, setup_1.initializeDatabase)().catch(console.error);
// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
