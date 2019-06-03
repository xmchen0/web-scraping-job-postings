/*---------------------*\
|* Import Dependencies *|
\*---------------------*/

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
const DelayedResponse = require('http-delayed-response');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const port = process.env.PORT || 3000

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
app.post('/scrape', (req, res, next) => {
  function slowfunction() {
    return submitController(req, res, next);
  }
  const delayed = new DelayedResponse(req, res, next);
  slowfunction(delayed.start(10 * 500, 20 * 1000));
});

// Set handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

/*---------*\
|* MongoDB *|
\*---------*/

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/linkedinjobs";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


/*--------*\
|* Routes *|
\*--------*/

// A GET Route for retireving and load data on index page
app.get("/", function (req, res) {
  // Find all unsaved articles in Article collection
  db.Article.find({ "saved": false }, function (error, data) {
    // Assign data found to variable
    var hbJson = {
      article: data
    };
    console.log(hbJson);
    // Display data response in index page
    res.render("index", hbJson);
  }, 1500);
});

// A GET route to saved articles and load data on saved page
app.get("/saved", function (req, res) {
  // Find all saved articles in Article collection and populate to note
  db.Article.find({ "saved": true }).populate("note").exec(function (error, articles) {
    // Assign data found to variable
    var hbJson2 = {
      article: articles
    };
    console.log(articles);
    // Display data response in saved page
    res.render("saved", hbJson2);
  });
});

// A GET route for scraping LINKEDIN website
app.get("/scrape", function (req, res) {

  // First, we grab the body of the html with axios
  axios.get("https://ca.linkedin.com/jobs/search?keywords=Full-stack%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0").then(function (response) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every job-result-card within a <li> tag, and do the following:
    $("li.job-result-card").each(function (i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h3").text();
      result.company = $(this).find("h4").text();
      result.location = $(this).find("span.job-result-card__location").text();
      result.date = $(this).find("time.job-result-card__listdate").attr("datetime");
      result.link = $(this).find("a").attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete!");
  });
});

// A POST route to save an article
app.post("/articles/save/:id", function (req, res) {
  // Use the article id to find and update its saved boolean
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
    // Execute the above query
    .exec(function (err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// A POST route for saving/updating an Article's associated Note
app.post("/notes/save/:id", function (req, res) {
  // console.log("body: " + req.body)
  // console.log("Id: " + req.params.id)
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbnote) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbnote);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// A GET route to delete articles on index page
app.get("/clear", function (req, res) {
  // Use the article id to find and update its saved boolean
  db.Article.remove({ "saved": false })
    // Execute the above query
    .exec(function (err, doc) {
      // Log any errors
      if (err) {
        // console.log(err);
      }
      else {
        // Or send the document to the browser
        res.redirect("/");
      }
    });
});

// A GET route to delete a saved note
app.get("/notes/delete/:id", function (req, res) {
  // Use the note id to find and delete it
  db.Note.findOneAndRemove({ "_id": req.params.id }).then(function (response) {
    // Redirected
    res.redirect("/saved")
  }).catch(function (err) {
    // Or send error to client
    res.json(err)
  });
});

// A POST route to delete a saved article
app.post("/articles/delete/:id", function (req, res) {
  // Use the article id to find and update its saved boolean
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
    // Execute the above query
    .exec(function (err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});


/*--------*\
|* Server *|
\*--------*/

// Start the server
app.listen(port, function () {
  console.log("App running on port " + port);
});
