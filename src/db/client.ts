import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

let db: Database | null = null;

/**
 * Get the database instance
 */
export function getDb(): Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}

/**
 * Initialize the database connection and schema
 */
export async function initDb(): Promise<void> {
    // Ensure data directory exists
    const dbDir = path.dirname(env.SQLITE_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
    }

    // Initialize SQL.js
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(env.SQLITE_PATH)) {
        const buffer = fs.readFileSync(env.SQLITE_PATH);
        db = new SQL.Database(buffer);
        console.log(`📂 Loaded existing database: ${env.SQLITE_PATH}`);
    } else {
        db = new SQL.Database();
        console.log(`📁 Created new database`);
    }

    // Load and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.run(schema);

    // Save the database
    saveDb();

    console.log(`✅ Database initialized: ${env.SQLITE_PATH}`);
}

/**
 * Save the database to disk
 */
export function saveDb(): void {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(env.SQLITE_PATH, buffer);
    }
}

/**
 * Close the database connection
 */
export function closeDb(): void {
    if (db) {
        saveDb();
        db.close();
        db = null;
        console.log('📁 Database connection closed');
    }
}

/**
 * Run a query and return all results
 */
export function query<T>(sql: string, params: unknown[] = []): T[] {
    const stmt = getDb().prepare(sql);
    stmt.bind(params as any[]);

    const results: T[] = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
    }
    stmt.free();

    return results;
}

/**
 * Run a query and return the first result
 */
export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
    const results = query<T>(sql, params);
    return results[0];
}

/**
 * Run an insert/update/delete
 */
export function execute(sql: string, params: unknown[] = []): void {
    getDb().run(sql, params as any[]);
    saveDb();
}

/**
 * Run multiple statements in a transaction
 */
export function transaction<T>(fn: () => T): T {
    getDb().run('BEGIN TRANSACTION');
    try {
        const result = fn();
        getDb().run('COMMIT');
        saveDb();
        return result;
    } catch (error) {
        getDb().run('ROLLBACK');
        throw error;
    }
}
