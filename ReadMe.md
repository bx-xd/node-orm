# Humble Node ORM inspired by Rails' ActiveRecord

## Intention

This is a humble beat of code inspired by Rails' ActiveRecord. My goal was to rebuild skeleton of ActiveRecord in plain Javascript ! I know, I know, there's a lot of it already...

## Setup

In order to use this humble ORM, you need two things :

**1. Install package** : `npm install humble-node-orm`

**2. Write a configuration file** :

Create a file at the root of your project named `node-orm.config.json`

```json
{
  "type": "sqlite",
  "database": "./database/test.db"
}
```

with this example, create a file into `database` folder named `test.db` à the root of your project

## Utilisation

```javascript
import { Model, ORM } from 'humble-node-orm';

class Post extends Model {
  constructor(data) {
    super(data);
    this.belongsTo(User);
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

    // Get user of a post
    const writer = await userPosts.at(0).user;
    console.log('Post Writer:', writer);

    // Update an instance of User
    if (lastUser) {
      const updatedUser = await lastUser.update({ pseudo: 'new_alice' });
      console.log('Updated User:', updatedUser);
    }

    // Delete an instance of User
    await lastUser.delete();
    console.log('User deleted');

    // Create a new not persisted instance
    const newUser2 = new User({ pseudo: 'Bobby', password: 'bob123' });
    console.log('Not persisted New User:', newUser2);
    const persistedUser2 = await newUser2.save();
    console.log('Persisted User:', persistedUser2);

    await newUser2.delete();
  } catch (err) {
    console.error(err);
  } finally {
    orm.close();
  }
}

main();


```

You can see an example in `example.js`

## Migrations

To create, run and revert migrations, you nedd to install `humble-node-orm` globally via

`npm install -g humble-node-orm`

You can handle a migration file to update database :

`humble-migrate migration:create <nameOfYourMigration>` => a file will be created into ./migrations folder

`humble-migrate migration:run` => it will play the migration file

`humble-migrate migration:revert` => it will revert the last migration file

## API

#### 1. **Class methods for a model :**

* `Model.all() `: get all entries from table.
* `Model.create(data) `: create a new entry to table.
* `Model.last(orderByColumn = 'id')` : get last entry, sort by specific column.
* `Model.find(conditions)` : get all entries corresponding to specified conditions.
* `Model.findById(id)` : get a entry by its id.

#### 2. **Instance methods  :**

* `instance.update(data)` : update an instance with new data.
* `instance.delete()` : delete an entry from table.

#### 3. Validations

Model as abstract class of any model expose a method that add validation(s) for a specific field

- `addValidation(column, callback_validation)` : this method must be declared into specific model that have a field must be validate. `field` is a string corresponding to a column of the model table and `callback_validation` is the function that will execute before insert or update a instance of model

#### 4. Relationship

Model expose two methods to define relationship between models :

- `hasMany(model, foreignKey = 'id')` : define a one-to-many relationship between two models

- `belongsTo(model, primaryKey = 'id')` : define a one-to-one relationship between two models