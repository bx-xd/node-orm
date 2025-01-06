import path from 'path';
import fs from 'fs';
import ORM from './orm.js';

function loadORMConfig() {
  try {
    const projectRoot = process.cwd();
    const configPath = path.resolve(projectRoot, 'node-orm.config.json');

    if (fs.existsSync(configPath)) {
      // fetch and parse the config file
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return new ORM(config);
    } else {
      throw new Error(`❌ Fichier de configuration 'node-orm.config.json' introuvable dans ${projectRoot}`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default loadORMConfig();
