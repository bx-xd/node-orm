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
export function insertData(tableName, attributes) {
  try {
    const keys = Object.keys(attributes);
    const columns = keys.join();
    const questionsMark = keys.map((i) => "?").join();
    const values = Object.values(attributes)
    var insertQuery = db.prepare(
      `INSERT INTO ${tableName} (${columns}) VALUES (${questionsMark});`
    );
    insertQuery.run(values);

    insertQuery.finalize();
  } catch (e) {
    console.log("erreur dans l'INSERT", e);
  }
}

// SEEDS
export function insertPosts() {
  const posts = [
    ["titre1", "mon contenu 1"],
    ["titre2", "mon contenu 2"],
    ["titre3", "mon contenu 3"],
  ];
  try {
    var insertQuery = db.prepare("INSERT INTO posts (title, content) VALUES (?,?)");
    posts.forEach(post => {
      insertQuery.run(post)
      console.log("Data inserted successfully :", post);
    })
    insertQuery.finalize();
  } catch (e) {
    console.log("erreur dans l'INSERT", e);
  }
}

// We poeple DB
db.serialize(async function () {
  db.run(
    "CREATE TABLE IF NOT EXISTS posts (post_id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL );"
  );
  let posts = await accessData("SELECT * FROM posts")
  console.log("POSTS in serializer! ", posts)
  if (posts.length === 0) {
    insertPosts()
  }
});

export default db;
