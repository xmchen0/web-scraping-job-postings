var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({

    // `title` is required and of type String
    title: {
        type: String,
        required: false
    },

    // `link` is required and of type String
    link: {
        type: String,
        required: false
    },

    // `summary` is required and of type String
    summary: {
        type: String,
        required: false
    },
    // `note` is an array that stores ObjectIds
    // The ref property links these ObjectIds to the Article model
    // This allows us to populate the User with any associated Articles
    note: [
        {
            // Store ObjectIds in the array
            type: Schema.Types.ObjectId,
            // The ObjectIds will refer to the ids in the Article model
            ref: "Note"
        }
    ]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
