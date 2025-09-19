import { Request, Response } from 'express';
import { processDocument } from '../services/pdfProcessor';
import { classifyDocument } from '../services/typeIdentifier';
import { analyzeMissingFields } from '../services/infoDetector';
import { getDatabase } from '../database/setup';

export async function analyzeDocument(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const text = await processDocument(req.file.path);

    // Classify document
    const { type, confidence } = await classifyDocument(text);

    // Analyze missing fields
    const missingFields = await analyzeMissingFields(text, type);

    // Store in database
    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO documents (name, type, content, confidence) VALUES (?, ?, ?, ?)',
      [req.file.originalname, type, text, confidence]
    );

    const documentId = result.lastID;

    // Store missing fields
    for (const field of missingFields) {
      await db.run(
        'INSERT INTO missing_fields (document_id, field_name, importance) VALUES (?, ?, ?)',
        [documentId, field.name, field.importance]
      );
    }

    res.json({
      id: documentId,
      type,
      confidence,
      missingFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing document' });
  }
}

export async function getDocumentById(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const document = await db.get(
      'SELECT * FROM documents WHERE id = ?',
      [req.params.id]
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const missingFields = await db.all(
      'SELECT field_name, importance FROM missing_fields WHERE document_id = ?',
      [req.params.id]
    );

    res.json({
      ...document,
      missingFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving document' });
  }
}
