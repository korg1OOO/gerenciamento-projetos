"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Task router (taskRoutes.ts)
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, taskController_1.getTasks);
router.post('/', authMiddleware_1.authMiddleware, taskController_1.addTask);
router.put('/:id', authMiddleware_1.authMiddleware, taskController_1.updateTask);
router.delete('/:id', authMiddleware_1.authMiddleware, taskController_1.deleteTask);
exports.default = router;
