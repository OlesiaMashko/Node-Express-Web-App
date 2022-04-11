const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const path = require('path');
const urlencodedParse = express.urlencoded({ extended: false })

var database = require('./config/database');
var Restaurants = require('./models/restaurants');
var app = express();
var db = mongoose.connection;
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)

const port = process.env.port || 8000;
const exphbs = require('express-handlebars');
const { resolve } = require('path');
const HBS = exphbs.create({
    helpers: {},
    layoutsDir: path.join(__dirname, "views/layouts"),
    extname: "hbs",
    defaultLayout: "main"
});

app.engine('.hbs', HBS.engine)
app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//to testing addNewRestaurant
var restaurant = new Restaurants({
    address: {
        building: "2211",
        coord: [-74.1377286, 40.6119572],
        street: "Victory Boulevard",
        zipcode: 10314
    },
    borough: "Olesia Mashkovtseva",
    cuisine: "Jewish/Kosher",
    grades: [{
        date: "2014-10-06T00:00:00.000+00:00",
        grade: "A",
        score: 9
    }],
    name: "Kosher Island",
    restaurant_id: "40356442",
});

//"Initializing" the Module
function initialize(connectedStr) {
    mongoose.connect(database.url, function(err) {
        if (err == null) console.info(connectedStr);
        else {
            console.error(err.message);
            process.exit();
        }
    });
}

//Create a new restaurant in the collection using the object passed in the "data" parameter
function addNewRestaurant(data) {
    return data.save()
}

//Return an array of all restaurants for a specific page, given the number of items per page
function getAllRestaurants(page, perPage, borough = {}) {
    return Restaurants
        .find(borough)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ restaurant_id: -1 })
        .lean()
}

//Return a single restaurant object
function getRestaurantById(id) {
    return Restaurants
        .findById(id)
}

// Overwrite an existing restaurant
function updateRestaurantById(data, Id) {
    return Restaurants
        .findByIdAndUpdate({ _id: Id }, data)
}

//Delete an existing restaurant 
function deleteRestaurantById(Id) {
    return Restaurants
        .deleteOne({ _id: Id })
}

//displays the mess in console if connected to db
initialize("Connected successfully");

//This route uses the body of the request to add a new "Restaurant"
app.post("/api/restaurants", function(req, res) {
    if (!req.body) return res.status(400).render('./partials/error.hbs', { message: "400, Bad Request" })
    let address = {
        building: req.body.building,
        coord: [req.body.lat, req.body.lon],
        street: req.body.street,
        zipcode: req.body.zipcode
    }
    let borough = req.body.borough
    let cuisine = req.body.cuisine
    let grades = [{
        date: req.body.date,
        grade: req.body.grade,
        score: req.body.score
    }]
    let name = req.body.name
    let restaurant_id = req.body.restaurant_id

    var newRestaurant = new Restaurants({
        address: address,
        borough: borough,
        cuisine: cuisine,
        grades: grades,
        name: name,
        restaurant_id: restaurant_id
    });

    //adding new rest. and checks the status 
    addNewRestaurant(restaurant)
        .then((restaurant) => {
            res
                .status(201)
                .send("Success");
        })
        .catch(err => res.status(500).render('./partials/error.hbs', { message: "500, " + err.message }));
})

//This route must accept the numeric query parameters "page" and "perPage" as well as the string parameter "borough"
app.get("/api/restaurants", function(req, res) {
    if (req.query.page == undefined || req.query.perPage == undefined) {
        return res.status(400).render('./partials/error.hbs', { message: "400, Bad Request" })
    }
    let page = req.query.page;
    let perPage = req.query.perPage;
    let borough = {}
    if (req.query.borough != undefined) {
        borough = { borough: req.query.borough }
    }
    getAllRestaurants(page, perPage, borough)
        .then((restaurants) => {
            let code = 200;
            if (restaurants.length == 0) code = 204;
            res
                .status(code)
                .render('./pages/restaurants.hbs', { restaurants: restaurants });
        })
        .catch(err => res.status(500).render('./partials/error.hbs', { message: "500, " + err.message }));
})



//////// DID JUST FOR TESTING

//gets the restaurant by ID
app.get("/getId", function(req, res) {
    getRestaurantById("5eb3d668b31de5d588f4292c")
        .then((restaurant) => {
            console.log(restaurant);
        })
        .catch((err) => {
            console.error(err.message);
        });
})

//updets restaurant by id
app.get("/updateById", function(req, res) {
    updateRestaurantById({ borough: "Olesia" }, "5eb3d668b31de5d588f4292c")
        .then((restaurant) => { console.log(restaurant); })
        .catch((err) => { console.error(err.message); });
})

//deletes the restaurant by id
app.get("/deleteById", function(req, res) {
    deleteRestaurantById("5eb3d668b31de5d588f4292c")
        .then((restaurant) => { console.log("deleted"); })
        .catch((err) => { console.error(err); });
})

////////////


app.use('/', function(req, res) {
    res.render('./partials/index', { title: 'Express' });
});

app.get('*', function(req, res) {
    res.render('./partials/error.hbs', { title: 'Error', message: 'Wrong Route' });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})