import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export async function initializeDatabase() {
  const db = await open({
    filename: process.env.DATABASE_PATH || './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    DROP TABLE IF EXISTS missing_fields;
    DROP TABLE IF EXISTS documents;

    CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE missing_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      field_name TEXT NOT NULL,
      importance TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      example TEXT NOT NULL,
      impact TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents (id)
      ON DELETE CASCADE
    );
  `);

  return db;
}

let _db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!_db) {
    _db = await initializeDatabase();
  }
  return _db;
}