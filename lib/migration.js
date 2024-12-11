import fs from 'fs';
import path from 'path';
import orm from '../lib/orm-config-loader.js';

class Migration {
  constructor(migrationsDir = './migrations') {
    this.orm = orm;
    this.migrationsDir = migrationsDir;
  }

  // Create a new migration file
  async create(name) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const filename = `${timestamp}_${name}.js`;
    const filePath = path.join(this.migrationsDir, filename);

    const template = `export default {
      up: async (db) => {
        // Ajoutez ici les requêtes pour appliquer la migration
      },

      down: async (db) => {
        // Ajoutez ici les requêtes pour annuler la migration
      }
    };`;

    // Create the directory if it doesn't exist
    fs.mkdirSync(this.migrationsDir, { recursive: true });
    fs.writeFileSync(filePath, template, 'utf-8');
    console.log(`Migration créée : ${filePath}`);
  }

  // Run all pending migrations
  async up() {
    const appliedMigrations = await this._getAppliedMigrations();
    const files = fs.readdirSync(this.migrationsDir).filter(file => file.endsWith('.js'));

    for (const file of files) {
      if (!appliedMigrations.includes(file)) {
        const migrationPath = path.resolve(process.cwd(), 'migrations', file);
        const migration = await import(`file://${migrationPath}`);

        console.log(`Application de la migration : ${file}`);
        await migration.default.up(this.orm.connection);

        // Register the migration as applied
        await this.orm.connection.query(`INSERT INTO migrations (name) VALUES (?)`, [file]);
      }
    }
  }

  // Cancel the last migration
  async down() {
    const appliedMigrations = await this._getAppliedMigrations();
    if (appliedMigrations.length === 0) {
      console.log('Aucune migration à annuler.');
      return;
    }

    const lastMigration = appliedMigrations[appliedMigrations.length - 1];
    const migrationPath = path.resolve(process.cwd(), 'migrations', lastMigration);
    const migration = await import(`file://${migrationPath}`);

    console.log(`✅  Annulation de la migration : ${lastMigration}`);
    await migration.default.down(this.orm.connection);

    // Remove the migration from the applied migrations
    await this.orm.connection.query(`DELETE FROM migrations WHERE name = ?`, [lastMigration]);
  }

  // Get the list of applied migrations
  async _getAppliedMigrations() {
    await this.orm.connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const rows = await this.orm.connection.query(`SELECT name FROM migrations`);
    return rows.map(row => row.name);
  }
}

export default Migration;
