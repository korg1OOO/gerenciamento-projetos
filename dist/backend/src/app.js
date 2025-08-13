"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const operationRoutes_1 = __importDefault(require("./routes/operationRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const expenseCategoryRoutes_1 = __importDefault(require("./routes/expenseCategoryRoutes"));
const operationTypeRoutes_1 = __importDefault(require("./routes/operationTypeRoutes"));
dotenv_1.default.config();
(0, database_1.default)();
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:8080',
    'https://gerenciamento-projetos-six.vercel.app' // Production frontend
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/operations', operationRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/expense-categories', expenseCategoryRoutes_1.default);
app.use('/api/operation-types', operationTypeRoutes_1.default);
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
