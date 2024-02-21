import * as sqlite3 from "sqlite3";

const DB = sqlite3.default.verbose();
let db = new DB.Database(
  "./databases/test.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
  }
);
console.log("Connected to the in-memory SQlite database.");

export async function accessData(query) {
  return new Promise(function (resolve, reject) {
    db.all(query, function (err, rows) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

async function db_all(query) {
  return new Promise(function (resolve, reject) {
    db.all(query, function (err, rows) {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

// To Insert Data
export function insertData(attributes) {
  try {
    console.log("atr", attributes);
    const keys = Object.keys(attributes);
    const columns = keys.join();
    const questionsMark = keys.map((i) => "?").join();
    const values = Object.values(attributes)
    var insertQuery = db.prepare(
      `INSERT INTO posts (${columns}) VALUES (${questionsMark})`
    );
    insertQuery.run(values);

    insertQuery.finalize();
  } catch (e) {
    console.log("erreur dans l'INSERT", e);
  }
}

// Working
export function insertPosts() {
  const posts = [
    ["titre1", "mon contenu 1"],
    ["titre2", "mon contenu 2"],
  ];
  try {
    var insertQuery = db.prepare("INSERT INTO posts VALUES (?,?,?)");
    for (var i = 0; i < posts.length; i++) {
      insertQuery.run([posts[i][0], posts[i][1]]);
      console.log("Data inserted successfully...");
    }
    insertQuery.finalize();
  } catch (e) {
    console.log("erreur dans l'INSERT", e);
  }
}

// On peuple la DB
db.serialize(function () {
  // These two queries will run sequentially.
  db.run(
    "CREATE TABLE IF NOT EXISTS posts (post_id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL );"
  );
  // insertPosts()
  // accessData('posts')
});

export default db;
