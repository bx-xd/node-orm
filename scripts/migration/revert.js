import Migration from '../../lib/migration.js';
import orm from '../../node-orm.config.js';

const migration = new Migration();

(async () => {
  try {
    await migration.down();
  } catch (err) {
    console.error("❌  Erreur lors de l'annulation de la migration :", err);
  } finally {
    orm.close();
  }
})();
