import express from "express";
import Post from "./models/post.js";
import Record from "./record.js";


// ### SERVER
// If you want, to can launch a HTTP server
// const app = express();
// app.get("/", async (req, res) => {

//   // If you want to try some actions
//   let posts = await Post.all();
//   console.log("tous les posts :\n", posts);
//   res.json({ posts });
// });

// const PORT = 3000;
// app.listen(PORT, async () => {
//   console.log("server is ready !");
// });

export { Post };
