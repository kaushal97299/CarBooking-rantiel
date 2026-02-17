const jwt = require("jsonwebtoken");

const generateToken = (id, role = "client") => {
  return jwt.sign(
    {
      id,
      role,
      type: role, // client / admin
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
