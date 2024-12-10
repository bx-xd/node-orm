import { ORM, Model } from './index.js';

// Initialisation de l'ORM
const db = new ORM({
  type: 'sqlite',
  host: 'localhost',
  user: 'root',
  password: '',
  database: './databases/test.db'
});


class User extends Model {
  constructor() {
    super(db, 'users');
  }
}

const userModel = new User();

async function main() {
  try {
    // Créer un utilisateur
    await userModel.create({ pseudo: 'Alice', password: 'kikou' });

    // Trouver un utilisateur par ID
    const user = await userModel.last();
    console.log('User:', user, user.id);

    const alice = await userModel.findById(user.id);
    console.log('User:', alice, alice.id);
    // // Mettre à jour un utilisateur
    const updatedUser = await userModel.update({ id: user.id }, { pseudo: 'Alicia' });
    console.log('MAJ User:', updatedUser);

    console.log(await userModel.all());
    // Supprimer un utilisateur
    await userModel.delete({ id: user.id });
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();