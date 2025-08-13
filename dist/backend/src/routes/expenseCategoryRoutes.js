"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/expenseCategoryRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const expenseCategoryController_1 = require("../controllers/expenseCategoryController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, expenseCategoryController_1.getExpenseCategories);
router.post('/', authMiddleware_1.authMiddleware, expenseCategoryController_1.addExpenseCategory);
router.put('/:id', authMiddleware_1.authMiddleware, expenseCategoryController_1.updateExpenseCategory);
router.delete('/:id', authMiddleware_1.authMiddleware, expenseCategoryController_1.deleteExpenseCategory);
exports.default = router;
