const authenticate = require("./auth");
const { authorize, checkOwnership } = require("./authorize");

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
};
