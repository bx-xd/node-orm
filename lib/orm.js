import Connection from './connection.js';
import QueryBuilder from './query-builder.js';

class ORM {
  constructor(config) {
    this.connection = new Connection(config);
    this.connection.connect();
  }

  /* RELATIONS */
  async fetchHasMany(relatedModelName, foreignKey, instanceId) {
    const sql = `SELECT * FROM ${relatedModelName} WHERE ${foreignKey} = ?`;
    return await this.connection.query(sql, [instanceId]);
  }

  /* CRUD methods */
  async find(table, conditions = {}) {
    const builder = new QueryBuilder(table);
    for (const [field, value] of Object.entries(conditions)) {
      builder.where(field, '=', value);
    }
    const query = builder.buildSelect();
    const values = Object.values(conditions);
    return await this.connection.query(query, values);
  }

  async insert(table, data) {
    const builder = new QueryBuilder(table);
    const { query, values } = builder.buildInsert(data);
    const result = await this.connection.query(query, values);
    return result;
  }

  async update(table, conditions, data) {
    const setClause = Object.keys(data)
      .map((field) => `${field} = ?`)
      .join(', ');
    const whereClause = Object.keys(conditions)
      .map((field) => `${field} = ?`)
      .join(' AND ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(conditions)];
    return await this.connection.query(sql, values);
  }

  async delete(table, conditions) {
    const whereClause = Object.keys(conditions)
      .map((field) => `${field} = ?`)
      .join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const values = Object.values(conditions);
    return await this.connection.query(sql, values);
  }

  async last(table, orderByColumn = 'id') {
    const sql = `SELECT * FROM ${table} ORDER BY ${orderByColumn} DESC LIMIT 1`;
    return await this.connection.query(sql);
  }

  close() {
    this.connection.close();
  }
}

export default ORM;
