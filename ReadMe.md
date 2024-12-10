# Node Base ORM

## Intention

This is a humble beat of code inspired by Rails' ActiveRecord. My goal was to rebuild skeleton of ActiveRecord in plain Javascript ! I know, I know, there's a lot of it already...

Setup

To install depencies : `yarn install` or `npm install` or `pnpm install`

In order to use this humble ORM, you need two things :

- configuration :

  ```javascript
  import { ORM } from 'node-orm'; 
  const orm = new ORM({
    type: 'sqlite',  // Type de base de données (sqlite, mysql, etc.)
    database: ':memory:', // Nom de la base de données ou chemin
  });
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
