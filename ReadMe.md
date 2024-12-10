# Node Base ORM

## Intention

This is a humble beat of code inspired by Rails' ActiveRecord. My goal was to rebuild skeleton of ActiveRecord in plain Javascript ! I know, I know, there's a lot of it already...

Setup

To install depencies : `yarn install` or `npm install` or `pnpm install`

In order to use this humble ORM, you need two things :

- configuration :

  1. Create a file at the root of your project named `node-orm.config.js`
  2. Setup your configuration with specific parameters, for example :

  ```javascript
  import ORM from 'node-orm';

  const orm = new ORM({
    type: 'sqlite',
    database: './databases/test.db',
  });

  export default orm;
  ```
- utilisation :

```javascript
import { Model } from 'node-orm'; 
class <ModelName> extends Model {
  constructor(data) {
    super(orm, '<tableName>', data);
  }
}
```

You can see an example in `example.js`


### Migrations

You can generate a migration file to update database :

`npm run migration:create < nameOfYourMigration >` => a file will be created into ./migrations folder

`npm run migration:run` => it will play the migration file

`npm run migration:revert` => it will revert the last migration file

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
