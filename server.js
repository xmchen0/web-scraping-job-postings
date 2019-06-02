// Dependencies
var express = require("express");
var exphbs = require('express-handlebars');
var logger = require("morgan");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set up handlebars, change extention name to hbs
app.engine("handlebars", exphbs({ defaultLayout: "main", extname: '.handlebars' }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/linkedinjobs", { useNewUrlParser: true });

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
}
else {
    mongoose.connect(databaseUri);
}

// Routes

// Render index page
app.get('/', (req, res) => {
    res.render('index')
});

// Route for getting all Jobs from the db
app.get("/jobs", function (req, res) {
    // Grab every document in the Jobs collection
    db.Jobs.find({})
        .then(function (dbJobs) {
            // If we were able to successfully find Jobss, send them back to the client
            res.json(dbJobs);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios to grab the HTML body from the site of your choice
    axios.get("https://www.linkedin.com/jobs/search?keywords=Software%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("li.job-result-card").each(function (i, element) {
            // console.log(element);
            // Save an empty result object
            var result = {};
            result.title = $(this).find("h3").text();
            result.location = $(this).find("span.job-result-card__location").text();
            result.date = $(this).find("time.job-result-card__listdate").attr("datetime");
            result.link = $(this).find("a").attr("href");

            // Create a new Jobs using the `result` object built from scraping
            db.Jobs.create(result)
                .then(function (dbJobs) {
                    // View the added result in the console
                    console.log(dbJobs);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
    });
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
});

// Route for grabbing a specific Jobs by id, populate it with it's note
app.get("/jobs/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Jobs.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("comment")
        .then(function (dbJobs) {
            // If we were able to successfully find an Jobs with the given id, send it back to the client
            res.json(dbJobs);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Jobs's associated Note
app.post("/jobs/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Jobs with an `_id` equal to `req.params.id`. Update the Jobs to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Jobs.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbJobs) {
            // If we were able to successfully update an Jobs, send it back to the client
            res.json(dbJobs);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
