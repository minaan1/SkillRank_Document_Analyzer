import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export async function initializeDatabase() {
  const db = await open({
    filename: process.env.DATABASE_PATH || './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS missing_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      field_name TEXT NOT NULL,
      importance TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents (id)
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