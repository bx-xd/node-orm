import { sendQuery, insertData, updateData } from "./connect.js";

class Record {
  constructor(attributes) {
    this.errors = {};
    if (attributes) {
      Object.assign(this, attributes);
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
    const item = await sendQuery(
      `SELECT * FROM ${table} WHERE id = ${recordID}`
    );
    if (item?.length === 0) return null;
    const object = new this(item?.at(0));
    return object;
  }

  async save() {
    const existingObj = this.id;
    if (!this.isValid()) {
      console.error("Validation errors:", this.errors);
      return this.errors;
    }
    existingObj ? this.update(this) : this.constructor.create(this);
  }

  static async create(attributes) {
    if (this.checkIsEmpty(attributes))
      return console.error("You can't save an empty object!");
    const keysAndValues = Object.entries(attributes);
    const filtered = keysAndValues.filter(
      ([key, value]) => key !== "id" && key !== "errors"
    );
    const objectWithoutId = Object.fromEntries(filtered);

    insertData(`${this.name.toLocaleLowerCase()}s`, objectWithoutId);
    const object = new this(attributes);
    return object;
  }

  async update(attributes) {
    const id = this.id;
    if (!id || !this || this.constructor.checkIsEmpty(attributes))
      return console.error("You can't update an non-persisting Instance !");
    let recordInDB = await this.constructor.find(id);
    const objectKeysAndValues = Object.entries(attributes);
    // Ne mettre à jour seulement que les données changées !
    const diffKeysValues = objectKeysAndValues.filter(
      ([key, value]) => recordInDB[key] !== value
    );
    const valuesWithoutId = Object.entries(attributes)
      .filter(([key, value]) => key !== "id" && key !== "errors")
      .map(([k, v]) => v)
      .join();
    const columnsEntries = diffKeysValues
      .map(([key, value]) => `${key} = ?`)
      .join();
    if (diffKeysValues.length > 0) {
      // MAJ de l'objet en DB

      updateData(this.tableName(), columnsEntries, id, valuesWithoutId);
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
    console.log(record);
    if (record) {
      await sendQuery(`DELETE FROM ${this.tableName()}s WHERE id = ${id};`);
      return true;
    } else {
      console.log("No instance found !");
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
}

export default Record;
