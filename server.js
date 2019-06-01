// Using the tools and techniques you learned so far,
// you will scrape a website of your choice, then place the data
// in a MongoDB database. Be sure to make the database and collection
// before running this exercise.

// Consult the assignment files from earlier in class
// if you need a refresher on Cheerio.

// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "linkedinjobs";
var collections = ["jobs"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Hello world");
});

// Routes

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function (req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    db.jobs.find({}, function (error, found) {
        // Log any errors if the server encounters one
        if (error) {
            console.log(error);
        }
        // Otherwise, send the result of this query to the browser
        else {
            res.json(found);
        }
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios to grab the HTML body from the site of your choice
    axios.get("https://www.linkedin.com/jobs/search?keywords=Software%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // An empty array to save the data that we'll scrape
        var results = [];

        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("li.job-result-card").each(function (i, element) {
            console.log(element);
            var title = $(element).find("h3").text();
            var location = $(element).find("span.job-result-card__location").text();
            var date = $(element).find("time.job-result-card__listdate").attr("datetime");
            var link = $(element).find("a").attr("href");

            // Save these results in an object that we'll push into the results array we defined earlier
            // results.push({
            //     title: title,
            //     location: location,
            //     date: date,
            //     link: link
            // });

            // If this found element had both a title and a link
            if (title && location && date && link) {
                // Insert the data in the scrapedData db
                db.jobs.insert({
                    title: title,
                    location: location,
                    date: date,
                    link: link
                },
                    function (err, inserted) {
                        if (err) {
                            // Log the error if one is encountered during the query
                            console.log(err);
                        }
                        else {
                            // Otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
            }
        });
    });
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
});

// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
