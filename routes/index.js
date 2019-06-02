const express = require("express");
const router = express.Router();
const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

// A GET route for all jobs
router.get("/", (req, res) => {
  db.Jobs.find({}).sort({ createdAt: -1 })
    .then(result => {
      console.log(`Jobs count: ${result.length}`);
      res.render("index", { Jobs: result });
    })
    .catch(err => {
      res.render("index", { Jobs: "failed to get jobs" });
    });
});

// A GET route for all commented jobs
router.get("/save", (req, res) => {
  db.Jobs.find({
    comments: {
      $exists: true,
      $ne: []
    }
  }).sort({ createdAt: -1 })
    .then(result => {
      console.log(`Jobs count(save): ${result.length}`);
      res.render("index", { Jobs: result });
    })
    .catch(err => {
      res.render("index", { Jobs: "failed to get jobs" });
    });
});

// A GET route for scraping jobs
router.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
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

    // Send a message to the client
    res.redirect("/");
  });
});

module.exports = router;
