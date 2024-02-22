import Record from "../record.js";

class Post extends Record {
  constructor(props) {
    super(props);
  }

  static validations = {
    title: [
      { validate: value => value && value.length > 0, message: "Title can't be blank" },
      { validate: value => value && value.length <= 100, message: "Title is too long" }
    ],
    content: [
      { validate: value => value && value.length > 0, message: "Content can't be blank" }
    ]
  };
}

export default Post;