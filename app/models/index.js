const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.package = require("./package.model");
db.delivery = require("./delivery.model");

db.ROLES = ["user", "admin", "driver"];

module.exports = db;