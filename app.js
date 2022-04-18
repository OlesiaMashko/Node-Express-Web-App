//Connect to required modules
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const path = require('path');
const urlencodedParse = express.urlencoded({ extended: false })
const { query } = require('express-validator');
const { check, validationResult } = require('express-validator');
require('dotenv').config()
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')

//Get database and model referencw
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
    partialsDir: 'views/partials',
    layoutsDir: path.join(__dirname, "views/layouts"),
    extname: "hbs",
    defaultLayout: "main"
});

app.engine('.hbs', HBS.engine)
app.set('view engine', '.hbs');
app.use(cookieParser());
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
    mongoose.connect(database.url, function (err) {
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
function updateRestaurantById(Id, borough, street) {
    return Restaurants
        .findByIdAndUpdate(Id, { address: { street: street }, borough: borough })
}

//Delete an existing restaurant 
function deleteRestaurantById(Id) {
    return Restaurants
        .deleteOne({ _id: Id })
}

//displays the mess in console if connected to db
initialize("Connected successfully");
var userPassword = "OreoluwaOlesia"

//authorization function to allow user to access certain route
const authorization = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN);   
      return next();
    } catch {
      return res.sendStatus(403);
    }
  };
//Login route to sign user in
app.post("/login", function(req, res){
    var password = req.body.password;
  
    const correct = bcrypt.compareSync(password,process.env.PASSWORD,);

    if(correct == true){
       const token = jwt.sign({password: process.env.PASSWORD}, process.env.ACCESS_TOKEN, {
        expiresIn: 86400 }) // expires in 24 hours
        return res
        .cookie("token", token)
        .status(200)
        .json({user_auth : "User authenticated"})
       }else{
        res.status(500).send("Wrong password")
       }
       
})

//This route uses the body of the request to add a new "Restaurant"
//The route can only be access if user is authorized
app.post("/api/restaurants", authorization, function (req, res) {
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

    addNewRestaurant(newRestaurant)
        .then((restaurant) => {
            res
                .status(201)
                .send("Success");
        })
        .catch(err => res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message }))
})

//This route must accept the numeric query parameters "page" and "perPage" as well as the string parameter "borough"
//Validation is done using express-validation
//The route can only be access if user is authorized
app.get("/api/restaurants", [
    check("page").notEmpty().withMessage("Page field should not be empty").isNumeric().withMessage("Page field must be a number"),
    check("perPage").notEmpty().withMessage("Per Page field should not be empty").isNumeric().withMessage("Per Page field must be a number"),
    check("borough").not().isNumeric().withMessage("Borough field must be a string"),
], authorization, function (req, res) {
    let page = req.query.page;
    let perPage = req.query.perPage;
    let borough = {}
    if (req.query.borough != undefined) {
        borough = { borough: req.query.borough }
    }
    const errors = validationResult(req);
    var msg = errors.array();

    var errMessage = "";
    for (var i = 0; i < msg.length; i++) {
        errMessage += msg[i].msg + "***"
    }
    //Display validation error
    if (!errors.isEmpty()) {
        return res.status(400).render('./partials/error.hbs', { title: "Status 400 ", message: errMessage })
    }
    getAllRestaurants(page, perPage, borough)
        .then((restaurants) => {
            let code = 201;
            if (restaurants.length == 0) code = 204;
            res
                .status(code)
                .json(restaurants)
        })
        .catch(err => res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message }));

})


//gets the restaurant by ID passed in the route
//user can access the route only if authorized
app.get("/api/restaurants/:_id", authorization, function (req, res) {
    var password = req.body.password;
    console.log(req.cookies);
        var id = req.params._id
        getRestaurantById(id)
            .then((restaurant) => {
                res
                    .status(201)
                    .json(restaurant);
                process.exit()
            })
            .catch((err) => {
                console.error(err.message);
                res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message })
            });
   
})

//update restaurant details by id passed in the route and other data in the
//request body
//user can access the route only if authorized
app.put("/api/restaurants/:_id", authorization, function (req, res) {
    var borough = req.body.borough
    var street = req.body.street
        updateRestaurantById(req.params._id, borough, street)
        .then((restaurant) => {
            res.status(201)
                .json(restaurant)
            process.exit()
        })
        .catch((err) => {
            console.error(err.message);
            res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message })
        });
 
})

//deletes the restaurant by id
//user can access the route only if authorized
app.delete("/api/restaurants/:_id", authorization, function (req, res) {
    var password = req.body.password;
  
        deleteRestaurantById(req.params)
        .then((restaurant) => {
            console.log(" restaurant deleted");
            res.status(201).send("Restaurant deleted")
        })
        .catch((err) => { res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message }) });
             
   })

//The route can only be access if user is authorized, it display the form in browser
app.get("/api/ui/restaurants", authorization, function (req, res) {
    res.render('./pages/form', { title: 'GET RESTAURANT' });
})

app.post("/api/ui/restaurants", [
    check("page").notEmpty().withMessage("Page field should not be empty").isNumeric().withMessage("Page field must be a number"),
    check("perPage").notEmpty().withMessage("Per Page field should not be empty").isNumeric().withMessage("Per Page field must be a number"),
    check("borough").notEmpty().withMessage("Borough field should not be empty").not().isNumeric().withMessage("Borough field must be a string"),
], function (req, res) {

    const errors = validationResult(req);
    var msg = errors.array();

    var errMessage = "";
    for (var i = 0; i < msg.length; i++) {
        errMessage += msg[i].msg + "***"
    }
    if (!errors.isEmpty()) {
        return res.status(400).render('./partials/error.hbs', { title: "Status 400 ", message: errMessage })
    }

    let page = req.body.page;
    let perPage = req.body.perPage;
    let borough = {}
    borough = { borough: req.body.borough }

    getAllRestaurants(page, perPage, borough)
        .then((restaurants) => {
            let code = 201;
            if (restaurants.length == 0)
                code = 204
            res
                .status(code)
                .render('./pages/restaurants.hbs', { restaurants: restaurants });
        })
        .catch(err => res.status(500).render('./partials/error.hbs', { title: "Status 500", message: err.message }));

})

 //logs user out 
   app.get("/logout", authorization, (req, res) => {
    return res
      .clearCookie("token")
      .status(200)
      .json({ message: "Successfully logged out" });
  });

 app.use('/', function (req, res) {
     res.render('./partials/index', { title: 'Express' });
 });

app.get('*', function (req, res) {
    res.render('./partials/error.hbs', { title: 'Error', message: 'Wrong Route' });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})