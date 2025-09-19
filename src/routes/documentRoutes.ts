import express from 'express';
import multer from 'multer';
import { analyzeDocument, getDocumentById } from '../controllers/documentController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('document'), analyzeDocument);
router.get('/:id', getDocumentById);

export const documentRouter = router;