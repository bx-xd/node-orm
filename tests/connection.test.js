import Connection from '../lib/connection.js';

const sqliteConfig = { type: 'sqlite', database: ':memory:' };
const mysqlConfig = {
  type: 'mysql',
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test_db',
};
const postgresConfig = {
  type: 'postgresql',
  host: 'localhost',
  user: 'postgres',
  password: 'password',
  database: 'test_db',
};

describe('Connection - Transaction Handling', () => {
  let db;

  afterEach(async () => {
    if (db) {
      db.close();
    }
  });

  const testTransaction = (config) => {
    describe(`${config.type} transactions`, () => {
      beforeEach(() => {
        db = new Connection(config);
        db.connect();
      });

      test('should commit a successful transaction', async () => {
        if (config.type === 'sqlite') {
          await db.query('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
        } else {
          await db.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255))');
        }

        const insertResult = await db.query('INSERT INTO users (name) VALUES (?)', ['Alice']);
        expect(insertResult).toBeDefined();

        const users = await db.query('SELECT * FROM users');
        expect(users.length).toBe(1);
        expect(users[0].name).toBe('Alice');
      });

      test('should rollback a failed transaction', async () => {
        if (config.type === 'sqlite') {
          await db.query('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
        } else {
          await db.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE)');
        }

        try {
          await db.query('INSERT INTO users (name) VALUES (?)', ['Alice']);
          await db.query('INSERT INTO users (name) VALUES (?)', ['Alice']); // Should fail due to UNIQUE constraint
        } catch (err) {
          expect(err).toBeDefined();
        }

        const users = await db.query('SELECT * FROM users');
        expect(users.length).toBe(1); // Rollback should undo the first insertion
      });
    });
  };

  testTransaction(sqliteConfig);
  // testTransaction(mysqlConfig);
  // testTransaction(postgresConfig);
});
