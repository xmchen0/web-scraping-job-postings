const express = require("express");
const router = express.Router();
const db = require("../models");

// GET /comments/test
router.get("/test", (req, res) => {
  res.json({ test: "/test"});
});

// GET /comment/:jobsId
// Jobs comment page
router.get("/:jobsId", (req, res) => {
  db.Jobs.findOne({
    _id: req.params.jobsId
  })
  .populate("comments")
  .then(jobs => {
    res.render("comment", { 
      jobs: jobs,
    });
  })
  .catch(err => res.send(err));
});

// POST /comment/:jobsId
// Add a comment to the jobsId
router.post("/:jobsId", (req, res) => {
  new db.Comment({
    title: req.body.title,
    body: req.body.comment,
    jobs: req.params.jobsId
  })
  .save()
  .then(comment => {
    db.Jobs.findOne({
      _id: comment.jobs
    })
    .then(jobs => {
      jobs.comments.push(comment._id);
      jobs
        .save()
        .then(article => {
          res.redirect("/comment/" + comment.jobs);
        })
        .catch(err => res.send(err));
    })
    .catch(err => res.send(err));
  });
});

// DELETE /comment/:commentId
// Remove the comment 
router.delete("/:commentId", (req, res) => {
  db.Comment.findOneAndDelete({
    _id: req.params.commentId
  })
  .then(comment => {
    db.Jobs.findOneAndUpdate({
      _id: comment.jobs
    }, {
      $pull: { comments: comment._id }
    }, {
      returnNewDocument: true
    })
    .populate("comments")
    .then(jobs => {
      res.render("comment", { 
        jobs: jobs,
      });
    })
    .catch(err => res.send(err));
  })
  .catch(err => res.send(err));
});

// Export the router
module.exports = router;