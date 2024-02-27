import { describe, expect, test } from "@jest/globals";
import { User, Post } from "../main";

describe("All", () => {
  test("can list", async () => {
    const users = await User.all();
    expect(users).toBeTruthy();
    expect(users[0]).toBeInstanceOf(User);

    const posts = await Post.all();
    expect(posts).toBeTruthy();
    expect(posts[0]).toBeInstanceOf(Post);
  });

  test("Can create an instance", async () => {
    const savedUser = await User.create({
      pseudo: "Fredon",
      password: "password",
    });
    const foundedUser = await User.find(savedUser.id);
    expect(savedUser).toMatchObject(foundedUser);
    expect(savedUser).toBeTruthy();
    expect(savedUser).toHaveProperty("pseudo");
    expect(savedUser).toHaveProperty("id");
  });

  test("Can delete an instance", async () => {
    const last = await User.last();
    await last.delete();
    const deletedUser = await User.find(last.id);
    expect(deletedUser).toBeNull();
  });

  test("Can find a persisting instance", async () => {
    const lastUser = await User.last();
    const foundedUser = await User.find(lastUser.id);
    expect(lastUser).toBeInstanceOf(User);
    expect(lastUser).toMatchObject(foundedUser);
  });

  test("can updating an instance", async () => {
    const lastUser = await User.last();
    const pseudo = `pseudo_${Math.floor(Math.random() * 10000000)}`;
    await lastUser.update({
      pseudo: pseudo,
    });
    const updatedUser = await User.find(lastUser.id);
    expect(lastUser.id).toEqual(updatedUser.id);
    expect(updatedUser.pseudo).toEqual(pseudo);
    expect(lastUser.pseudo).not.toEqual(updatedUser.pseudo);
  });
});
