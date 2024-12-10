// query-builder.js
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.selectFields = '*';
    this.conditions = [];
    this.limitValue = null;
    this.orderByClause = null;
  }

  select(fields) {
    this.selectFields = fields.join(', ');
    return this;
  }

  where(field, operator, value) {
    this.conditions.push({ field, operator, value });
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.orderByClause = `${field} ${direction}`;
    return this;
  }

  buildSelect() {
    let query = `SELECT ${this.selectFields} FROM ${this.table}`;
    if (this.conditions.length > 0) {
      const conditionStrings = this.conditions.map(c => `${c.field} ${c.operator} ?`);
      query += ` WHERE ${conditionStrings.join(' AND ')}`;
    }
    if (this.orderByClause) {
      query += ` ORDER BY ${this.orderByClause}`;
    }
    if (this.limitValue !== null) {
      query += ` LIMIT ${this.limitValue}`;
    }
    return query;
  }

  buildInsert(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    return {
      query: `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${placeholders})`,
      values: Object.values(data),
    };
  }
}

export default QueryBuilder;
