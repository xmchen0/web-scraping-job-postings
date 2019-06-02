// Load express and mongodb 
const express = require("express");
const router = express.Router();
const db = require("../../models");

// GET /api/jobs
// Route for getting all jobs from the db
router.get("/", function(req, res) {
  db.Jobs.find({})
    .then(function(dbJobs) {
      res.json(dbJobs)
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET /api/jobs/:id
// Route for grabbing a specific jobs by id, 
// populate it with comments
router.get("/:id", function(req, res) {
  db.Jobs.findOne({ _id: req.params.id })
    .populate("comments")
    .then(function(dbJobs) {
      res.json(dbJobs);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// POST /api/jobs/:id
// Route for saving/updating an jobs and an associated comment
router.post("/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Jobs.findOneAndUpdate({ 
        _id: req.params.id 
      }, { 
        comment: dbComment._id 
      }, { 
        new: true 
      });
    })
    .then(function(dbComment) {
      res.json(dbComment);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// DELETE /api/jobs/:id
// Route for a comment
router.delete("/:id", function(req, res) {
  db.Jobs.deleteOne({
    _id: req.params.id
  })
  .then(result => {
    db.Comment.deleteMany({
      jobs: req.params.id
    })
    .then(delComments => {
      res.json(delComments);
    })
    .catch(commErr => res.json(commErr));
  })
  .catch(err => res.json(err));
});


module.exports = router;