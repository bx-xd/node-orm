import orm from './orm-config-loader.js'

class Model {
  #orm = orm;
  #tableName;
  constructor(tableName, data = {}) {
    this.#tableName = tableName;
    Object.assign(this, data);
  }


  static async all() {
    const thisClass = new this(this.orm, this.tableName);
    const results = await thisClass.#orm.find(thisClass.#tableName);
    return results.map(data => new this(data));
  }

  static async create(data) {
    const thisClass = new this(this.orm, this.tableName);
    const result = await thisClass.#orm.insert(thisClass.#tableName, data);
    return new this({ ...data, id: result.insertId });
  }

  static async last(orderByColumn = 'id') {
    const thisClass = new this(this.orm, this.tableName);
    const result = await thisClass.#orm.last(thisClass.#tableName, orderByColumn);
    if (result.length === 0) return null;
    return new this(result[0]);
  }

  static async find(conditions) {
    const thisClass = new this(this.orm, this.tableName);
    const results = await thisClass.#orm.find(thisClass.#tableName, conditions);
    return results.map(data => new this(data));
  }

  static async findById(id) {
    const results = await this.find({ id });
    return results.length > 0 ? results[0] : null;
  }

  async update(data) {
    await this.#orm.update(this.#tableName, { id: this.id }, data);
    return new this.constructor({ ...this, ...data });
  }

  async delete() {
    await this.#orm.delete(this.#tableName, { id: this.id });
  }
}

export default Model;
