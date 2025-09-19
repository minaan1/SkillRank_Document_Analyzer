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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDocument = analyzeDocument;
exports.getDocumentById = getDocumentById;
const pdfProcessor_1 = require("../services/pdfProcessor");
const typeIdentifier_1 = require("../services/typeIdentifier");
const infoDetector_1 = require("../services/infoDetector");
const setup_1 = require("../database/setup");
function analyzeDocument(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Extract text from PDF
            const text = yield (0, pdfProcessor_1.processDocument)(req.file.path);
            // Classify document
            const { type, confidence } = yield (0, typeIdentifier_1.classifyDocument)(text);
            // Analyze missing fields
            const missingFields = yield (0, infoDetector_1.analyzeMissingFields)(text, type);
            // Store in database
            const db = yield (0, setup_1.getDatabase)();
            const result = yield db.run('INSERT INTO documents (name, type, content, confidence) VALUES (?, ?, ?, ?)', [req.file.originalname, type, text, confidence]);
            const documentId = result.lastID;
            // Store missing fields
            for (const field of missingFields) {
                yield db.run('INSERT INTO missing_fields (document_id, field_name, importance) VALUES (?, ?, ?)', [documentId, field.name, field.importance]);
            }
            res.json({
                id: documentId,
                type,
                confidence,
                missingFields
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error processing document' });
        }
    });
}
function getDocumentById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield (0, setup_1.getDatabase)();
            const document = yield db.get('SELECT * FROM documents WHERE id = ?', req.params.id);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }
            const missingFields = yield db.all('SELECT field_name, importance FROM missing_fields WHERE document_id = ?', req.params.id);
            res.json(Object.assign(Object.assign({}, document), { missingFields }));
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error retrieving document' });
        }
    });
}
