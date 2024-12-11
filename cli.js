#!/usr/bin/env node
import { Command } from 'commander';
import { Migration } from './index.js';
import orm from './lib/orm-config-loader.js';

const program = new Command();
const migration = new Migration();

// Commande pour créer une migration
program
  .command('migration:create <name>')
  .description('Créer une nouvelle migration')
  .action(async (name) => {
    if (!name) {
      console.error('❌  Erreur : Veuillez spécifier le nom de la migration.');
      process.exit(1);
    }
    try {
      await migration.create(name);
      console.log(`✅  Migration "${name}" créée avec succès.`);
    } catch (err) {
      console.error('❌  Erreur lors de la création de la migration :', err);
    }
  });

// Commande pour jouer les migrations
program
  .command('migration:run')
  .description('Appliquer toutes les migrations')
  .action(async () => {
    try {
      await migration.up();
      console.log('✅  Toutes les migrations ont été appliquées.');
    } catch (err) {
      console.error('❌  Erreur lors de l\'application des migrations :', err);
    } finally {
      orm.close();
    }
  });

// Commande pour annuler les migrations
program
  .command('migration:revert')
  .description('Annuler la dernière migration')
  .action(async () => {
    try {
      await migration.down();
      console.log('✅  La dernière migration a été annulée.');
    } catch (err) {
      console.error('❌  Erreur lors de l\'annulation de la migration :', err);
    } finally {
      orm.close();
    }
  });

program.parse(process.argv);
