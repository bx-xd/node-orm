import { accessData, insertData } from "./connect.js";

export default class Record {
  constructor(attributes) {
    const keys = Object.entries(attributes);
    keys.forEach(([key, value]) => {
      this[key] = value;
    });
  }

  static async all() {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const data = await accessData(`SELECT * FROM ${table}`);
    const records = data.map((obj) => {
      const object = new obj_constructor(obj);
      return object;
    });
    return Promise.all(records);
  }

  static async find(id) {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const item = await accessData(
      `SELECT * FROM ${table} WHERE ${this.name.toLocaleLowerCase()}_id = ${id}`
    );
    if (item?.length === 0) return null;
    const object = new obj_constructor(item?.at(0));
    return object;
  }

  async save() {
    const existingObj = this?.id;
    existingObj ? this.update(this) : this.create(this);
  }

  async create(attributes) {
    const keysAndValues = Object.entries(attributes);
    const filtered = keysAndValues.filter(([key, value]) => key !== "id");
    const objectWithoutId = Object.fromEntries(filtered);

    insertData(`${this.tableName()}s`, objectWithoutId);
    const object = new this.constructor(this);
    return object;
  }

  async update(attributes) {
    let recordInDB = await this.constructor.find(this?.id);
    const objectKeysAndValues = Object.entries(attributes);
    // Ne mettre à jour seulement que les données changées !
    const diffKeysValues = objectKeysAndValues.filter(
      ([key, value]) => recordInDB[key] !== value
    );
    const query = diffKeysValues
      .map(([key, value]) => `${key} = '${value}'`)
      .join();
    if (query.length > 0) {
      // MAJ de l'objet en DB
      await accessData(
        `UPDATE ${this.tableName()}s SET ${query} WHERE ${this.tableName()}_id = ${
          attributes.id
        }`
      );
      recordInDB = await this.constructor.find(this?.id);
    } else {
      console.log("Aucun changement !");
    }
    return recordInDB;
  }

  async delete() {
    const record = await this.constructor.find(this.id);
    console.log(record);
    if (record) {
      await accessData(
        `DELETE FROM ${this.tableName()}s WHERE ${this.tableName()}_id = ${
          this.id
        };`
      );
      return true;
    } else {
      console.log("No instance found !");
    }
  }

  tableName() {
    return `${this.constructor.name.toLocaleLowerCase()}`;
  }
}
