import { sendQuery, insertData, updateData } from "./connect.js";

class Record {
  constructor(attributes) {
    this.errors = {};
    if (attributes) {
      Object.assign(this, attributes);
    }

    const relation = this.constructor.relationship;
    if (relation.belongsTo) {
      (async () => {
        const modelBelong = await import(
          `./models/${relation.belongsTo.toLowerCase()}.js`
        );
        const model = modelBelong.default;
        const modelName = await model.name.toLowerCase();
        this[modelName] = async () => await model.find(this[`${modelName}_id`]);
      })();
    }
    if (relation.hasMany) {
      (async () => {
        const modelBelong = await import(
          `./models/${relation.hasMany.toLowerCase()}.js`
        );
        const model = modelBelong.default;
        const modelName = await model.name.toLowerCase();
        this[`${modelName}s`] = async () =>
          await model.find_by({
            [`${this.constructor.name.toLowerCase()}_id`]: this.id,
          });
      })();
    }
  }

  static async all() {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const data = await sendQuery(`SELECT * FROM ${table}`);
    const records = data.map((obj) => {
      const object = new this(obj);
      return object;
    });
    return records;
  }

  static async last(index = -1) {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const data = await sendQuery(`SELECT * FROM ${table}`);
    if (Math.abs(index) > data.length) {
      return console.error("This instance doesn't exist at this index!");
    }
    return new this(data.at(index));
  }

  static async find(recordID) {
    if (!recordID) return console.error("This instance doesn't exist in DB !");
    const table = `${this.name.toLocaleLowerCase()}s`;
    const items = await sendQuery(
      `SELECT * FROM ${table} WHERE id = ${recordID}`
    );
    if (items?.length === 0) return null;
    const object = new this(items?.at(0));
    return object;
  }

  static async find_by(attributes) {
    if (!attributes)
      return console.error("This instance doesn't exist in DB !");
    const table = `${this.name.toLocaleLowerCase()}s`;
    const whereQuery = Object.keys(attributes).map(
      (i) => `${i} = '${attributes[i]}'`
    );
    const items = await sendQuery(`SELECT * FROM ${table} WHERE ${whereQuery}`);
    return items;
  }

  async save() {
    const existingObj = this.id;
    if (!this.isValid()) {
      console.error("Validation errors:", this.errors);
      return this.errors;
    }
    if (existingObj) {
      return this.update(this);
    } else {
      return this.constructor.create(this);
    }
  }

  static async create(attributes) {
    // Si il n'existe pas d'attributs, on retourne une erreur
    if (Object.keys(attributes).length === 0)
      return console.error("Empty object");
    // on déconstruit l'objet
    const keysAndValues = Object.entries(attributes);
    const acceptedCols = await this.getColumns();
    // On filtre pour ne garder que les colonnes voulues en DB
    const filtered = keysAndValues.filter(([key, value]) =>
      acceptedCols.includes(key)
    );

    // Si il n'existe pas d'attributs, on retourne une erreur
    if (Object.keys(filtered).length === 0)
      return console.error("Empty object after filtering");
    // on reconstruit l'objet
    const filteredObject = Object.fromEntries(filtered);
    insertData(`${this.name.toLocaleLowerCase()}s`, filteredObject);
    // On prend en DB l'objet et on le redonne passé dans le moule de la classe
    const lastSaved = await this.last();
    const record = await this.find(lastSaved.id);
    return new this(record);
  }

  async update(attributes) {
    const id = this.id;
    if (!id || !this || this.constructor.checkIsEmpty(attributes))
      return console.error("You can't update an non-persisting Instance !");
    let recordInDB = await this.constructor.find(id);

    const acceptedCols = await this.constructor.getColumns();
    // Ne mettre à jour seulement que les données changées et les colonnes acceptées !
    const objectKeysAndValues = Object.entries(attributes)
      .filter(([key, value]) => acceptedCols.includes(key))
      .filter(([key, value]) => recordInDB[key] !== value);

    const filteredValues = objectKeysAndValues.map(([k, v]) => v).join();
    const columnsEntries = objectKeysAndValues
      .map(([key, value]) => `${key} = ?`)
      .join();
    if (objectKeysAndValues.length > 0) {
      // MAJ de l'objet en DB
      updateData(this.tableName(), columnsEntries, id, filteredValues);
      recordInDB = await this.constructor.find(id);
    } else {
      console.log("No Change !");
    }
    return recordInDB;
  }

  async delete() {
    const id = this?.id;
    if (!id)
      return console.error("You can't delete an non-persisting Instance !");
    const record = await this.constructor.find(id);
    if (record) {
      await sendQuery(`DELETE FROM ${this.tableName()}s WHERE id = ${id};`);
      return true;
    } else {
      console.log("No instance found !");
      return false;
    }
  }

  tableName() {
    return `${this.constructor.name.toLocaleLowerCase()}`;
  }

  static checkIsEmpty(object) {
    if (Object.keys(object).length === 0) {
      console.log("Empty Object!");
      return true;
    }
  }

  isValid() {
    this.errors = {};
    const validations = this.constructor.validations || {};
    Object.entries(validations).forEach(([attr, rules]) => {
      const shouldPresent = rules.map((i) => i?.presence === true);
      rules.forEach((rule) => {
        if (shouldPresent && !this[attr]?.length > 0) {
          this.errors[attr] = [`${attr} can't be blank`];
        } else if (rule.validate && !rule.validate(this[attr])) {
          this.errors[attr] = [...(this.errors[attr] ?? []), rule.message];
        }
      });
    });
    return Object.keys(this.errors).length === 0;
  }
  static async getColumns() {
    const data = await sendQuery(`PRAGMA table_info(${this.name}s)`);
    return data.map((col) => col.name).filter((col) => col !== "id");
  }
}

export default Record;
