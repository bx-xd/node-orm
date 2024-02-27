import Record from "../record.js";

class User extends Record {
  constructor(props) {
    super(props);
  }

  static relationship = {
    hasMany: "post"
  }

  static validations = {
    pseudo: [
      { presence: true },
      { validate: value => value && value.length <= 26, message: "Pseudo is too long" }
    ],
    password: [
      { presence: true }
    ]
  };
}

export default User;