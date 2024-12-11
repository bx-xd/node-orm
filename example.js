import { Model, ORM } from './index.js';

class Post extends Model {
  constructor(data) {
    super(data);
  }
}
// Define User Model
class User extends Model {
  constructor(data) {
    super(data);
    this.hasMany(Post);
    this.addValidation('pseudo', this.validatePseudo);
  }

  validatePseudo(pseudo) {
    return pseudo.length > 3;
  }
}

const orm = new ORM({
  type: 'sqlite',
  database: './databases/test.db'
});

// Use case
async function main() {
  try {
    await orm.connection.query(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, pseudo TEXT, password TEXT)`);

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

    // Get all posts of a user
    const userPosts = await foundUser.posts;
    console.log('User Posts:', userPosts);

    // Update an instance of User
    if (lastUser) {
      const updatedUser = await lastUser.update({ pseudo: 'new_alice' });
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
    orm.close();
  }
}

main();
