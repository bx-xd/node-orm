// model.js
class Model {
  constructor(orm, tableName) {
    this.orm = orm;
    this.tableName = tableName;
  }

  all() {
    return this.orm.find(this.tableName);
  }

  find(conditions) {
    return this.orm.find(this.tableName, conditions);
  }

  findById(id) {
    return this.find({id}).then((data) => data[0] ?? null);
  }


  last() {
    return this.orm.last(this.tableName).then((data) => data[0]);
  }

  create(data) {
    return this.orm.insert(this.tableName, data);
  }

  update(conditions, data) {
    return this.orm.update(this.tableName, conditions, data);
  }

  delete(conditions) {
    return this.orm.delete(this.tableName, conditions);
  }
}

export default Model;
