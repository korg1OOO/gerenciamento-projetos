var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Client from '../models/Client';
import Operation from '../models/Operation';
export const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let clients;
        if (user.permissions.canAccessAllProjects) {
            clients = yield Client.find().populate('createdBy', 'name email');
        }
        else {
            const accessibleOperations = yield Operation.find({
                $or: [
                    { _id: { $in: user.permissions.assignedOperations } },
                    { createdBy: user._id },
                ],
            }).select('_id');
            const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
            clients = yield Client.find({
                $or: [
                    { operationId: { $in: accessibleOpIds } },
                    { createdBy: user._id },
                ],
            }).populate('createdBy', 'name email');
        }
        const responseData = clients.map((client) => (Object.assign(Object.assign({}, client.toJSON()), { id: client._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const addClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clientData = req.body;
    try {
        const client = new Client(Object.assign(Object.assign({}, clientData), { createdBy: req.user._id, createdAt: new Date() }));
        yield client.save();
        const responseData = Object.assign(Object.assign({}, client.toJSON()), { id: client._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const client = yield Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedClient = yield Client.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedClient.toJSON()), { id: updatedClient._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const client = yield Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Client.findByIdAndDelete(id);
        res.json({ message: 'Client deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
