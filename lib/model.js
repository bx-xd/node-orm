import orm from './orm-config-loader.js'

class Model {
  #orm = orm;
  #tableName;
  #validations = [];
  constructor(data = {}) {
    this.#tableName =`${this.constructor.name.toLowerCase()}s`;
    Object.assign(this, data);
  }

  addValidation(field, validatorFn) {
    this.#validations.push({ field, validatorFn });
  }

  static async validate(data) {
    const thisClass = new this;
    const errors = [];

    for (const { field, validatorFn } of thisClass.#validations) {
      if (!validatorFn(data[field])) {
        errors.push(`${field} est invalide. : ${data[field]}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
  }

  static async all() {
    const thisClass = new this;
    const results = await thisClass.#orm.find(thisClass.#tableName);
    return results.map(data => new this(data));
  }

  static async create(data) {
    await this.validate(data);
    const thisClass = new this;
    await thisClass.#orm.insert(thisClass.#tableName, data);
    return new this(data);
  }

  static async last(orderByColumn = 'id') {
    const thisClass = new this;
    const result = await thisClass.#orm.last(thisClass.#tableName, orderByColumn);
    if (result.length === 0) return null;
    return new this(result[0]);
  }

  static async find(conditions) {
    const thisClass = new this;
    const results = await thisClass.#orm.find(thisClass.#tableName, conditions);
    return results.map(data => new this(data));
  }

  static async findById(id) {
    const results = await this.find({ id });
    return results.length > 0 ? results[0] : null;
  }

  async update(data) {
    await this.constructor.validate(data);
    await this.#orm.update(this.#tableName, { id: this.id }, data);
    return new this.constructor({ ...this, ...data });
  }

  async delete() {
    await this.#orm.delete(this.#tableName, { id: this.id });
  }
}

export default Model;
