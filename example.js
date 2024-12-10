import { ORM, Model } from './index.js';

// Initialisation de l'ORM
const db = new ORM({
  type: 'sqlite',
  database: ':memory:'
});

// Define User Model
class User extends Model {
  constructor(data) {
    super(db, 'users', data);
  }
}

// Use case
async function main() {
  try {
    await db.connection.query(`CREATE TABLE users (id INTEGER PRIMARY KEY, pseudo TEXT, password TEXT)`);

    // create a new user
    const newUser = await User.create({ pseudo: 'Alice', password: 'alice123' });
    console.log('New User:', newUser);

    // Get the last user
    const lastUser = await User.last();
    console.log('Last User:', lastUser);

    // Get all users
    const users = await User.all();
    console.log('All Users:', users);

    // Fetch a specific user by ID
    const foundUser = await User.findById(1);
    console.log('Found User:', foundUser);

    // Update an instance of User
    if (lastUser) {
      const updatedUser = await lastUser.update({ pseudo: 'alice_updated' });
      console.log('Updated User:', updatedUser);
      console.log(await User.findById(lastUser.id));
    }

    // Delete an instance of User
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
