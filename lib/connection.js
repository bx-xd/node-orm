// connect.js
import mysql from 'mysql2';
import pkg from 'pg';
const { Client: PgClient } = pkg;
import sqlite3 from 'sqlite3';

class Connection {
  constructor(config) {
    this.config = config;
    this.client = null;

    switch (config.type) {
      case 'mysql':
        this.client = mysql.createConnection(config);
        break;
      case 'postgresql':
        this.client = new PgClient(config);
        break;
      case 'sqlite':
        this.client = new sqlite3.Database(config.database);
        break;
      default:
        throw new Error('Unsupported database type');
    }
  }

  connect() {
    if (this.config.type === 'sqlite') {
      console.log('Connected to SQLite database');
    } else {
      this.client.connect((err) => {
        if (err) {
          throw new Error(`Database connection error: ${err.message}`);
        }
        console.log(`Connected to ${this.config.type} database`);
      });
    }
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.config.type === 'sqlite') {
        this.client.serialize(() => {
          this.client.run('BEGIN TRANSACTION', (beginErr) => {
            if (beginErr) return reject(beginErr);

            this.client.all(sql, params, (err, result) => {
              if (err) {
                console.error('Transaction error:', err);
                this.client.run('ROLLBACK', () => reject(err));
              } else {
                this.client.run('COMMIT', (commitErr) => {
                  if (commitErr) {
                    console.error('Transaction error:', commitErr);
                    return reject(commitErr)
                  }
                  resolve(result);
                });
              }
            });
          });
        });
      } else {
        this.client.query('BEGIN', (beginErr) => {
          if (beginErr) return reject(beginErr);

          this.client.query(sql, params, (err, result) => {
            if (err) {
              console.error('Transaction error:', commitErr);
              this.client.query('ROLLBACK', () => reject(err));
            } else {
              this.client.query('COMMIT', (commitErr) => {
                if (commitErr) return reject(commitErr);
                resolve(result);
              });
            }
          });
        });
      }
    });
  }

  close() {
    if (this.client.end) {
      this.client.end();
    } else if (this.config.type === 'sqlite') {
      this.client.close();
    }
  }
}

export default Connection;
