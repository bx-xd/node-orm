import path from 'path';
import fs from 'fs';

async function loadORMConfig() {
  try {
    const projectRoot = process.cwd();
    const configPath = path.resolve(projectRoot, 'node-orm.config.js');

    if (fs.existsSync(configPath)) {
      const ormConfig = await import(configPath);
      return ormConfig.default;
    } else {
      throw new Error(`❌ Fichier de configuration 'orm-config.js' introuvable dans ${projectRoot}`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default await loadORMConfig();
