/*---------------------*\
|* Import Dependencies *|
\*---------------------*/

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
// const DelayedResponse = require('http-delayed-response');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
// const db = require("./models");

const port = process.env.PORT || 8080

// Initialize Express
const app = express();

/*-------------------*\
|* Config Middleware *|
\*-------------------*/

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Make public a static folder
app.use(express.static("./public"));

// Testing http-delayed-response npm
// app.post('/scrape', (req, res, next) => {
//   function slowfunction() {
//     return submitController(req, res, next);
//   }
//   const delayed = new DelayedResponse(req, res, next);
//   slowfunction(delayed.start(10 * 500, 20 * 1000));
// });

// Set handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "./views/layouts/partials")
}));
app.set("view engine", "handlebars");

/*--------*\
|* Routes *|
\*--------*/

// Import routes and give the server access to them.
var routes = require("./routes/routes.js");

app.use(routes);

/*---------*\
|* MongoDB *|
\*---------*/

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/linkedinjobs";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

/*--------*\
|* Server *|
\*--------*/

// Start the server
app.listen(port, function () {
  console.log("App running on port " + port);
});
