import { accessData, insertData } from "./connect.js";

export default class Record {
  constructor(attributes) {
    const keys = Object.entries(attributes)
    keys.forEach(([key, value]) => {
      this[key] = value
    })
    // this.init(attributes);
  }

  static async all() {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const data = await accessData(`SELECT * FROM ${table}`);
    const records = data.map((obj) => {
      const object = new obj_constructor(obj);
      return object
      // const obj_initaliazed = object.init(obj);
      // return obj_initaliazed;
    });
    return Promise.all(records);
  }

  static async find(id) {
    const table = `${this.name.toLocaleLowerCase()}s`;
    const obj_constructor = this;
    const item = await accessData(`SELECT * FROM ${table} WHERE id = ${id}`);
    if (item?.length === 0) return null
    const object = new obj_constructor(item?.at(0));
    return Promise.resolve(object)
    // const obj_initaliazed = object.init(object);
    // return Promise.resolve(obj_initaliazed)
  }

  async save() {
    const existingObj = this?.id
    existingObj ? this.update(this) : this.create(this)
  }

  async create(attributes) {
    const keysAndValues = Object.entries(attributes)
    const filtered = keysAndValues.filter(([key, value]) => key !== 'id')
    const objectWithoutId = Object.fromEntries(filtered)
    console.log(objectWithoutId)

    insertData(objectWithoutId)
    // const object = this.init(this)
    const object = new this.constructor(this)
    return object
  }

  async update(attributes) {
    let recordInDB = await this.constructor.find(this?.id)
    const objectKeysAndValues = Object.entries(attributes)
    // Ne mettre à jour seulement que les données changées !
    const diffKeysValues = objectKeysAndValues.filter(([key, value]) => recordInDB[key] !== value)
    const query = diffKeysValues.map(([key, value]) => `${key} = '${value}'`).join()
    if (query.length > 0) {
      // MAJ de l'objet en DB
      await accessData(`UPDATE ${this.table()} SET ${query} WHERE id = ${attributes.id}`);
      recordInDB = await this.constructor.find(this?.id)
      console.log(recordInDB)
    } else {
      console.log("Aucun changement !")
    }
    return recordInDB
  }

  async delete() {
    const record = await this.constructor.find(this.id)
    console.log(record)
    if (record) {
      await accessData(`DELETE FROM ${this.table()} WHERE id = ${this.id};`)
    }
    return true
  }

  // async init(attributes) {
  //   const cols = await this.getColumns();
  //   for (let key in cols) {
  //     this[cols[key]] = attributes[cols[key]];
  //   }
  //   return Promise.resolve(this);
  // }

  // async getColumns() {
  //   const table = this.table();
  //   return new Promise(async function (resolve, reject) {
  //     const data = await accessData(`SELECT * FROM ${table}`);
  //     const obj = await data?.at(0);
  //     if (obj) {
  //       const columns = Object.keys(obj);
  //       resolve(columns);
  //     }
  //   });
  // }

  table() {
    return `${this.constructor.name.toLocaleLowerCase()}s`
  }
}
