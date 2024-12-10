import { ORM, Model } from './index.js';

// Initialisation de l'ORM
const db = new ORM({
  type: 'sqlite',
  database: ':memory:',
});

// Définir le modèle `User`
class User extends Model {
  constructor(data) {
    super(db, 'users', data);
  }
}

// Exemple d'utilisation
async function main() {
  try {
    await db.connection.query(`CREATE TABLE users (id INTEGER PRIMARY KEY, pseudo TEXT, password TEXT)`);

    // Créer un nouvel utilisateur
    const newUser = await User.create({ pseudo: 'Alice', password: 'alice123' });
    console.log('New User:', newUser);

    // Récupérer le dernier utilisateur
    const lastUser = await User.last();
    console.log('Last User:', lastUser);

    // Récupérer tous les utilisateurs
    const users = await User.all();
    console.log('All Users:', users);

    // Récupérer un utilisateur par ID
    const foundUser = await User.findById(1);
    console.log('Found User:', foundUser);

    // Mettre à jour le dernier utilisateur
    if (lastUser) {
      const updatedUser = await lastUser.update({ pseudo: 'alice_updated' });
      console.log('Updated User:', updatedUser);
      console.log(await User.findById(lastUser.id));
    }

    // Supprimer l'utilisateur
    await lastUser.delete();
    console.log('User deleted');

    console.log('All Users:', await User.all());
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();
