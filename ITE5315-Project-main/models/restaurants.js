// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
RestSchema = new Schema({

    address: {
        building: {
            type: String
        },
        coord: {
            type: [
                Number
            ]
        },
        street: {
            type: String
        },
        zipcode: {
            type: Date
        }
    },
    borough: {
        type: String
    },
    cuisine: {
        type: String
    },
    grades: {
        type: [{
            date: {
                    type: Date
            },
            grade: {
                type: String
            },
            score: {
                type: Number
            }
        }]
    },
    name: {
        type: String
    },
    restaurant_id: {
        type: String
    }
});

module.exports = mongoose.model('restaurants', RestSchema);