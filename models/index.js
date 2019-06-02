// Exporting an object containing all of our models

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/linkedinjobs",
    Jobs: require("./Jobs"),
    Comment: require("./Comments"),
};