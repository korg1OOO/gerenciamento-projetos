"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/operationTypeRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const operationTypeController_1 = require("../controllers/operationTypeController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, operationTypeController_1.getOperationTypes);
router.post('/', authMiddleware_1.authMiddleware, operationTypeController_1.addOperationType);
router.put('/:id', authMiddleware_1.authMiddleware, operationTypeController_1.updateOperationType);
router.delete('/:id', authMiddleware_1.authMiddleware, operationTypeController_1.deleteOperationType);
exports.default = router;
