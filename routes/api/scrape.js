// Load models 
const db = require("../../models");

// Modules for scraping
const axios = require("axios");
const cheerio = require("cheerio");

// the target web site config
const LinkedinURL = "https://www.linkedin.com/jobs/search?keywords=Software%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0";

function scrapeLinkedin(url = LinkedinURL) {
  // First, grab the body of the html with axios
  axios.get(url).then(response => {
    // collect articles in the body
    const jobsInfo = collectLinkedin(response.data).map(jobs => {
      jobs.link = url + jobs.link;
      return jobs;
    });
    console.log(`Found ${jobsInfo.length} jobs`);
    addJobs(jobsInfo);
  });
}

function collectLinkedin(data) {
  // Collect objects of jobs info into this "jobs" array
  let jobs = [];
  const $ = cheerio.load(data);

  context.each(function (i, element) {
    jobs.push({
      title: $(this).find("h3").text(),
      location: $(this).find("span.job-result-card__location").text(),
      date: $(this).find("time.job-result-card__listdate").attr("datetime"),
      link: $(this).find("a").attr("href")
    });
  });

  return articles;
}

// Insert jobs into the Jobs collection
function addJobs(jobs) {
  console.log(`Adding ${jobs.length} jobs`);

  jobs.forEach(item => {
    db.Jobs.findOneAndUpdate({
      link: item.link
    },
      item, {
        upsert: true,
        returnNewDocument: true
      })
      .catch(err => console.log(err));
  });
}

module.exports = scrapeLinkedin;
