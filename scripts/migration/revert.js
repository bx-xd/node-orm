import { Migration } from '../../index.js';
import orm from '../../lib/orm-config-loader.js';

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
