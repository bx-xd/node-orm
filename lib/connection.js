// connect.js
import mysql from 'mysql2';
import pkg from 'pg';
const { Client: PgClient } = pkg;
import sqlite3 from 'sqlite3';
import { customLogger } from './logger.js';

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
      customLogger.success('Connected to SQLite database');
    } else {
      this.client.connect((err) => {
        if (err) {
          throw new Error(`Database connection error: ${err.message}`);
        }
        customLogger.success(`Connected to ${this.config.type} database`);
      });
    }
  }

  logQuery(sql, params) {
    const paramsString = params ? JSON.stringify(params) : '';
    customLogger.log(`[SQL LOG] Query: ${sql} ${params ? `| Params: ${paramsString}` : ''}`);
  }

  async query(sql, params = []) {
    const isWriteOperation = this._isWriteOperation(sql);

    let result;
    try {
      if (isWriteOperation) {
        await this._beginTransaction();
      }

      this.logQuery(sql, params);
      result = await this._executeQuery(sql, params);

      if (isWriteOperation) {
        await this._commitTransaction();
      }
    } catch (err) {
      await this._rollbackTransaction();
      throw err;
    }
    return result;
  }

  async _beginTransaction() {
    if (this.inTransaction) {
      customLogger.log('Transaction already active, skipping BEGIN TRANSACTION');
      return;
    }

    this.logQuery('BEGIN TRANSACTION');
    this.inTransaction = true;

    if (this.config.type === 'sqlite') {
      await new Promise((resolve, reject) =>
        this.client.run('BEGIN TRANSACTION', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    } else {
      await new Promise((resolve, reject) =>
        this.client.query('BEGIN', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    }
  }

  async _executeQuery(sql, params) {
    return new Promise((resolve, reject) => {
      if (this.config.type === 'sqlite') {
        this.client.all(sql, params, (err, rows) => (err ? reject(new Error(err)) : resolve(rows)));
      } else {
        this.client.query(sql, params, (err, rows) => (err ? reject(new Error(err)) : resolve(rows)));
      }
    });
  }

  async _commitTransaction() {
    if (!this.inTransaction) {
      customLogger.log('No active transaction to commit');
      return;
    }

    this.logQuery('COMMIT TRANSACTION');
    this.inTransaction = false;

    if (this.config.type === 'sqlite') {
      await new Promise((resolve, reject) =>
        this.client.run('COMMIT', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    } else {
      await new Promise((resolve, reject) =>
        this.client.query('COMMIT', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    }
  }

  async _rollbackTransaction() {
    if (!this.inTransaction) {
      customLogger.log('No active transaction to roll back');
      return;
    }

    customLogger.error('ROLLBACK TRANSACTION');
    this.inTransaction = false;

    if (this.config.type === 'sqlite') {
      await new Promise((resolve, reject) =>
        this.client.run('ROLLBACK', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    } else {
      await new Promise((resolve, reject) =>
        this.client.query('ROLLBACK', (err) => (err ? reject(new Error(err)) : resolve()))
      );
    }
  }

  _isWriteOperation(sql) {
    const writeKeywords = ['INSERT', 'UPDATE', 'DELETE'];
    const firstWord = sql.trim().split(/\s+/)[0].toUpperCase();
    return writeKeywords.includes(firstWord);
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
