import ORM from './lib/orm.js';

const orm = new ORM({
  type: 'sqlite',
  database: './databases/test.db',
});

export default orm;