import Migration from '../../lib/migration.js';
import orm from '../../node-orm.config.js';

const migration = new Migration();
console.log(migration.migrationsDir);

(async () => {
  try {
    await migration.up();
    console.log('✅  Toutes les migrations ont été appliquées.');
  } catch (err) {
    console.error("❌  Erreur lors de l'application des migrations :", err);
  } finally {
    orm.close();
  }
})();
