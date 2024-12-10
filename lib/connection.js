// connect.js
import mysql from 'mysql2';
// import { Client as PgClient } from 'pg';
import sqlite3 from 'sqlite3';

class Connection {
  constructor(config) {
    this.config = config;
    this.client = null;

    switch (config.type) {
      case 'mysql':
        this.client = mysql.createConnection(config);
        break;
      // case 'postgresql':
      //   this.client = new PgClient(config);
      //   break;
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
        this.client.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        this.client.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
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
