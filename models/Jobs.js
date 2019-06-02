var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var JobsSchema = new Schema({

    // `title` is required and of type String
    title: {
        type: String,
        required: true
    },

    // `location` is required and of type String
    location: {
        type: String,
        required: true
    },

    // `date` is required and of type String
    date: {
        type: String,
        required: true
    },

    // `link` is required and of type String
    link: {
        type: String,
        required: true
    },
    // `saved` is required and of type String
    saved: {
        type: Boolean,
        default: false
    },

    // `note` is an array that stores ObjectIds
    // The ref property links these ObjectIds to the Article model
    // This allows us to populate the User with any associated Articles
    note: [
        {
            // Store ObjectIds in the array
            type: Schema.Types.ObjectId,
            // The ObjectIds will refer to the ids in the Article model
            ref: "Comment"
        }
    ]
});

// This creates our model from the above schema, using mongoose's model method
var Jobs = mongoose.model("Jobs", JobsSchema);

// Export the Article model
module.exports = Jobs;
