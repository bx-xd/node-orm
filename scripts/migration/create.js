import { Migration } from '../../index.js';

const migration = new Migration();

// Récupérer le nom de la migration depuis les arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌  Erreur : Veuillez spécifier le nom de la migration.');
  console.error('Exemple : npm run create:migration create_users_table');
  process.exit(1);
}

(async () => {
  await migration.create(migrationName);
})();
