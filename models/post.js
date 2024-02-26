import Record from "../record.js";

class Post extends Record {
  constructor(props) {
    super(props);
  }

  static validations = {
    title: [
      { presence: true },
      { validate: value => value && value.length <= 100, message: "Title is too long" }
    ],
    content: [
      { presence: true }
    ]
  };
}

export default Post;