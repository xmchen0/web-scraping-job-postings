// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var app = express();

app.use(express.static("./public"));

// var Article = require("./models/Article.js");
var db = require("./models");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Morgan and body parser
app.use(logger("dev"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Mongo with Mongoose
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/linkedinjobs";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//GET request to show Handlebars pages
app.get("/", function (req, res) {
  db.Article.find({ "saved": false }, function (error, data) {
    var hbJson = {
      article: data
    };
    console.log(hbJson);
    res.render("index", hbJson);
  });
});

app.get("/saved", function (req, res) {
  db.Article.find({ "saved": true }).populate("note").exec(function (error, articles) {
    var hbJson2 = {
      article: articles
    };
    console.log(articles);
    res.render("saved", hbJson2);
  });
});

// A GET route for scraping TAV website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.linkedin.com/jobs/search?keywords=Software%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("li.job-result-card").each(function (i, element) {
      // An empty array to save the data that we'll scrape
      var result = {};

      // console.log(element);
      result.title = $(this).find("h3").text();
      result.location = $(this).find("span.job-result-card__location").text();
      result.date = $(this).find("time.job-result-card__listdate").attr("datetime");
      result.link = $(this).find("a").attr("href");

      db.Article.create(result)
        .then(function (dbJobs) {
          console.log(dbJobs);
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

// Save an article
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

// Create a new note
// Route for saving/updating an Article's associated Note
app.post("/notes/save/:id", function (req, res) {
  console.log("body: " + req.body)
  console.log("Id: " + req.params.id)
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbnote) {
      // Update an Article,
      res.json(dbnote);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Delete an article
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

// Delete a note
app.get("/notes/delete/:id", function (req, res) {
  // Use the note id to find and delete it
  db.Note.findOneAndRemove({ "_id": req.params.id }).then(function (response) {
    res.redirect("/saved")
  }).catch(function (err) {
    res.json(err)
  })

})


// Delete an article
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

// Start the server
app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
