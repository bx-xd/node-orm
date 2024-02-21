import { sendQuery, insertData, updateData } from "./connect.js";

class Record {
  constructor(attributes) {
    const keys = Object.entries(attributes);
    keys.forEach(([key, value]) => {
      this[key] = value;
    });
  }

  static async all() {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const data = await sendQuery(`SELECT * FROM ${table}`);
    const records = data.map((obj) => {
      const object = new obj_constructor(obj);
      return object;
    });
    return Promise.all(records);
  }

  static async last(index = -1) {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const data = await sendQuery(`SELECT * FROM ${table}`);
    if (Math.abs(index) > data.length) {
      return console.log("This instance doesn't exist at this index!")
    }
    return new this(data.at(index));
  }

  static async find(recordID) {
    if (!recordID) return console.error("This instance doesn't exit in DB !");
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const item = await sendQuery(
      `SELECT * FROM ${table} WHERE id = ${recordID}`
    );
    if (item?.length === 0) return null;
    const object = new obj_constructor(item?.at(0));
    return object;
  }

  async save() {
    const existingObj = this.id;
    existingObj ? this.update(this) : this.constructor.create(this)
    // await this.construtor.create(this);
  }

  static async create(attributes) {
    const keysAndValues = Object.entries(attributes);
    const filtered = keysAndValues.filter(([key, value]) => key !== "id");
    const objectWithoutId = Object.fromEntries(filtered);

    insertData(`${this.name.toLocaleLowerCase()}s`, objectWithoutId);
    const object = new this(attributes);
    return object;
  }

  async update(attributes) {
    const id = this.id;
    if (!id || !this) return console.error("You can't update an non-persisting Instance !")
    let recordInDB = await this.constructor.find(id);
  const objectKeysAndValues = Object.entries(attributes);
  // Ne mettre à jour seulement que les données changées !
  const diffKeysValues = objectKeysAndValues.filter(
    ([key, value]) => recordInDB[key] !== value
    );
    const valuesWithoutId = Object.entries(attributes)
      .filter(([k, v]) => k !== 'id')
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
      console.log("Aucun changement !");
    }
    return recordInDB;
  }

  async delete() {
    const id = this?.id;
    if (!id) return console.error("You can't delete an non-persisting Instance !");
    const record = await this.constructor.find(id);
    console.log(record);
    if (record) {
      await sendQuery(
        `DELETE FROM ${this.tableName()}s WHERE id = ${id};`
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

export default Record;