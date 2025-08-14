"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.addClient = exports.getClients = void 0;
const Client_1 = __importDefault(require("../models/Client"));
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let clients;
        if (user.role === 'admin') {
            clients = yield Client_1.default.find().populate('createdBy', 'name email');
        }
        else {
            clients = yield Client_1.default.find({ createdBy: user._id }).populate('createdBy', 'name email');
        }
        const responseData = clients.map((client) => (Object.assign(Object.assign({}, client.toJSON()), { id: client._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getClients = getClients;
const addClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = req.body;
    try {
        const client = new Client_1.default(Object.assign(Object.assign({}, clientData), { createdBy: req.user._id, createdAt: new Date() }));
        yield client.save();
        const responseData = Object.assign(Object.assign({}, client.toJSON()), { id: client._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addClient = addClient;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const client = yield Client_1.default.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedClient = yield Client_1.default.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedClient.toJSON()), { id: updatedClient._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateClient = updateClient;
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const client = yield Client_1.default.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Client_1.default.findByIdAndDelete(id);
        res.json({ message: 'Client deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteClient = deleteClient;
