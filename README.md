# web-scraping-job-postings

For this assignment, I will be attempting to web scrape [job postings from Linkedin!](https://ca.linkedin.com/jobs/search?keywords=Web%20Developer&location=Toronto%2C%20Ontario%2C%20Canada&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0&f_TP=1%2C2) using Mongoose and Cheerio.

URL contains specifics including:
- Search param: "Full Stack Developer"
- Search param: "Toronto, CA"
- Filter - Date posted: Last week

## What the app should do:
1. needs to be able to scrape articles from a website
2. save those articles
3. remove saved articles
4. save comments to saved articles
5. remove comments from saved articles
6. all store comments should be visible to every user
7. comments should be saved to the database as well and associated with their articles

## What information should display:
* Headline - the title of the article
* Summary - a short summary of the article
* URL - the url to the original article
* Feel free to add more content to your database (photos, bylines, and so on).

## Link to final assignment:
https://hello-jobs.herokuapp.com/


# * * *

## Reflection
June 3rd, 2019
  
Toronto, Canada
  
Dear Reader,

This is an open letter to confess how I failed spectacularly to get my app working locally and deploying to Heroku. Despite the fact I pulled through in the end with a working app, I'm held responsible to talk about this ordeal so I may grow and learn from this experience in case I forget in the future. Through this letter, I hope to shed light on my thought process and offer some tips and advice on how anyone can avoid or overcome the same Heroku issues.
  
### --- IDEA ---

Following the solved activity 20-Scraping-With-Mongoose posted in GitLab, I revisted the work example to gain an understanding of the file structure and functionality. I setup my file directory in a similar fashion to the solved working activity to minimise confusion and follow the best practice. I chose Linkedin Jobs because I think it would be interesting and practical and useful to further develop in the future when I will be job-hunting.

### --- TECHNOLOGIES ---

<b>File Structure</b>

If you explored the class activity 20-Scraping-With-Mongoose you will notice the controller/router is integrated inside server.js and does not have a controller to handle your router nor does it have handlebars. I decided to setup a controller and handlebars for clarity and to meet requirements.

<b>Cheerio and Axios</b>

Using the scrapping tools - Cheerio and Axios, I tested scraping [blogTO](https://www.blogto.com/), [Futurism](https://futurism.com/) and [The Australian](https://www.theaustralian.com.au/). When I didn't receive any response after trying multiple times, I moved on to the next website.
  
<b>MongoDB and Mongoose</b>

In comparison to Sequelise, connecting MongoDB with Mongoose was a breeze. However if you do run into any issues with connecting to MongoDB, here's what you can do:
  
First, open the terminal and write `mongod --dbpath {your project's path}`
Second, open a new terminal and enter your project's path, write `mongo`

Here's how connecting to MongoDB appears in server.js

```
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/linkedinjobs";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
```
Note: The original code derived from the instructions did not include "linkedinjobs", "mongoose.Promise = Promise" and "{ useNewUrlParser: true }"

<b>Heroku</b>

After trying and failing to deploy my app to Heroku, my app successfully deployed after ~40 commits. Here's some tips if you come across a similiar error:
  
My error: <b>heroku error code: h12 - request timeout, status 503.</b> Read more about the error on Heroku website here https://devcenter.heroku.com/articles/error-codes#h12-request-timeout or here https://devcenter.heroku.com/articles/request-timeout

My first thought was "the Linkedin URL that's scraping the data from is too long, too complicated for Axios to read". Consequently I tweaked the URL several times by using different filters or changing the result properties, but no matter how I tweaked it the app seems to be working fine locally. 
  
My second thought was there was something wrong with my GET Route for retireving and load data on index page since that's what the heroku log specified as I ran `heroku logs --tail`. 
  
All my hypothesises were wrong. Turns out this error occurred because when a web request take an excessive amount of time to process by the app, the router will terminate the request if it takes longer than 30 seconds to complete.
  
Then I thought about creating a new heroku git repo to start fresh. Guess what? It worked like magic. My app finally deployed!
  
To avoid the timeout error, the request must be processed in the dyno by your app and a response delivered back to the router within 30 seconds. You can check the request time by double clicking anywhere on the web page and select "inspect" > "networking". Or if you want, try creating a new heroku git repo and re-deploy. Here's how you can do that in your command line:

Set new Heroku URL git repo: `git remote set-url heroku <repo git>`
Check you have switched to new repo: `git remote -v`
Push code to new repo: 
  `git add .`
  `git commit -m "uploading to new repo"`
  `git push heroku master`

### --- LESSONS ---
* Do our homework -> check GitLab -> look for resources
* Do explore and experiment with class examples
* Do create a new heroku app to test your deployment

### --- IMPROVEMENTS ---
* Scrape Indeed job search results
* Add another database for Indeed
* Front end - spruce up the UI - make it look pretty and responsive

Thank you for reading to the end!

💬🦜

<hr>
<i>© Kathy Chen 2019 | Acknowledgement: UofT Coding Bootcamp 2019
