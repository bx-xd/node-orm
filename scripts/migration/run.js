import { Migration } from '../../index.js';
import orm from '../../lib/orm-config-loader.js';

const migration = new Migration();

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
