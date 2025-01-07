import orm from './orm-config-loader.js';

class Model {
  #orm = orm;
  #tableName;
  constructor(data = {}) {
    this.#tableName = `${this.constructor.name.toLowerCase()}s`;
    Object.assign(this, data);
  }

  /* RELATIONS */
  hasMany(relatedModel, foreignKey = `${this.constructor.name.toLowerCase()}_id`) {
    const instance = this;
    const relatedModelName = `${relatedModel.name.toLowerCase()}s`
    Object.defineProperty(this, relatedModelName, {
      get: async () => {
        const results = await instance.#orm.fetchHasMany(relatedModelName, foreignKey, this.id);
        return results.map((data) => new relatedModel(data));
      }
    })
  }

  belongsTo(relatedModel, primaryKey = 'id') {
    const instance = this;
    const relatedModelName = `${relatedModel.name.toLowerCase()}s`
    Object.defineProperty(this, relatedModel.name.toLowerCase(), {
      get: async () => {
        const results = await instance.#orm.fetchBelongsTo(relatedModelName, primaryKey, this.id);
        return new relatedModel(results.at(0));
      }
    })
  }

  /* VALIDATIONS */
  static async validate(data) {
    const errors = [];
    const validations = this.validations || {};

    for (const [field, validatorFn] of Object.entries(validations)) {
      if (!validatorFn(data[field])) {
        errors.push(`${field} est invalide. : ${data[field]}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
  }

  /* CLASS METHODS */
  static async all() {
    const thisClass = new this();
    const results = await thisClass.#orm.find(thisClass.#tableName);
    return results.map((data) => new this(data));
  }

  static async create(data) {
    await this.validate(data);
    const thisClass = new this();
    const results = await thisClass.#orm.insert(thisClass.#tableName, data);
    return new this(results.at(0));
  }

  static async last(orderByColumn = 'id') {
    const thisClass = new this();
    const result = await thisClass.#orm.last(thisClass.#tableName, orderByColumn);
    if (result.length === 0) return null;
    return new this(result.at(0));
  }

  static async find(conditions) {
    const thisClass = new this();
    const results = await thisClass.#orm.find(thisClass.#tableName, conditions);
    return results.map((data) => new this(data));
  }

  static async findById(id) {
    const results = await this.find({ id });
    return results.length > 0 ? results.at(0) : null;
  }

  /* INSTANCE METHODS */
  async update(data) {
    await this.constructor.validate(data);
    const results = await this.#orm.update(this.#tableName, { id: this.id }, data);
    return new this.constructor(results.at(0));
  }

  async delete() {
    if (!this.id) return;
    await this.#orm.delete(this.#tableName, { id: this.id });
  }

  async save() {
    return this.id ? await this.update(this) : await this.constructor.create(this);
  }
}

export default Model;
