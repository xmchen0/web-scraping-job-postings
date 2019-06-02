const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new Schema object
const CommentSchema = new Schema({
    title: {
        type: String,
        default: null
    },

    body: {
        type: String,
        required: true
    },

    // store an Article id
    article: {
        type: Schema.Types.ObjectId,
        ref: "Jobs"
    },

    // `createdAt` is a time when this comment is inserted
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the comment model
const Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;
