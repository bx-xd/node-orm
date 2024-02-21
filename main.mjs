import express from "express";
import Post from "./models/post.js";

const app = express()

app.get("/", async (req, res) => {
  // let post = new Post({title: "coucou !", content: "Nice content" });
  // console.log('post', post)
  // post.save()
  let posts = await Post.all();
  const postTwo = await Post.find(2)
  postTwo.title = 'Nouveau Nouveau !!!'
  postTwo.save()
  console.log('tous les posts :\n', posts);
  res.json({ posts })
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log("server is ready !");
});
