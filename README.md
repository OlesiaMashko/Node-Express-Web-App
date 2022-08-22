# Node/Express WEB Application 

## Description: Developed a Secure db-driven Node/Express Web App. 

### Project Specification: 
**Step 1: Loading the [Sample Restaurant Data](https://github.com/OlesiaMashko/ITE5315-Project/blob/main/package-lock.json) JSON file in MongoDB Atlas.** 

**Step 2: Building a Web API:**
1. You need to install express, cors, mongoose + set up Git repository 
2. Add a module to interact with Restaurant MongoDB 
o "Initializing" the Module before the server starts 
3. To ensure that we can indeed connect to the MongoDB Atlas cluster with our 
new connection string, we must invoke the db.initialize(“connection string…”) 
method and only start the server once it has succeeded, otherwise we should 
show the error message in the console 
- This module will provide the 6 (promise-based) functions required by our Web API for 
this particular dataset 
- db.initialize("Your MongoDB Connection String Goes Here"): Establish a connection with 
the MongoDB server and initialize the "Restaurant" model with the "restaurant" 
collection (used above) 
- db.addNewRestaurant(data): Create a new restaurant in the collection using the object 
passed in the "data" parameter 
- db.getAllRestaurants(page, perPage, borough): Return an array of all restaurants for a 
specific page (sorted by restaurant_id), given the number of items per page. For 
example, if page is 2 and perPage is 5, then this function would return a sorted list of 
restaurants (by restaurant_id), containing items 6 – 10. This will help us to deal with the 
large amount of data in this dataset and make paging easier to implement in the UI 
later. Additionally, there is an optional parameter "borough" that can be used to filter 
results by a specific "borough" value 
- db.getRestaurantById(Id): Return a single restaurant object whose "_id" value matches 
the "Id" parameter 
- updateRestaurantById(data,Id): Overwrite an existing restaurant whose "_id" value 
matches the "Id" parameter, using the object passed in the "data" parameter. 
- deleteRestaurantById(Id): Delete an existing restaurant whose "_id" value matches the 
"Id" parameter 
4. Add the routes : The next piece that needs to be completed before we have a functioning Web 
API is to actually define the routes (listed Below). Note: Do not forget to return an error 
message if there was a problem and make use of the status codes 201, 204 and 500 where 
applicable. 
5. POST /api/restaurants 
- This route uses the body of the request to add a new "Restaurant" document to the 
collection and return the created object / fail message to the client. 
6. GET /api/restaurants 
- This route must accept the numeric query parameters "page" and "perPage" as well as 
the string parameter "borough", ie: 
/api/restaurants?page=1&perPage=5&borough=Bronx. It will use these values to return 
all "Restaurant" objects for a specific "page" to the client as well as optionally filtering 
by "borough", if provided. 
7. EXTRA CHALLENGE: add query param validation to your route in order to make sure that the 
params you expect are present, and of the type you expect. You can do this using packages like 
https://www.npmjs.com/package/celebrate or https://express-validator.github.io/docs/checkapi.html. If the params are incorrect, your route should return a 400 response (client error) vs. 
500 (server error). 
8. GET /api/restaurants 
- This route must accept a route parameter that represents the _id of the desired 
restaurant object, ie: /api/restaurants/ 5eb3d668b31de5d588f4292e. It will use this 
parameter to return a specific "Restaurant" object to the client. 
9. PUT /api/restaurants 
- This route must accept a route parameter that represents the _id of the desired 
restaurant object, ie: /api/restaurants/5eb3d668b31de5d588f4292e as well as read the 
contents of the request body. It will use these values to update a specific "Restaurant" 
document in the collection and return a success / fail message to the client. 
10. DELETE /api/restaurants 
- This route must accept a route parameter that
represents the _id of the desired 
restaurant object, ie: /api/restaurants/5eb3d668b31de5d588f4292e. It will use this 
value to delete a specific "Restaurant" document from the collection and return a 
success / fail message to the client. 

**Step 3: Add UI/Form:**
You want to demonstrate your skill in working with Template Engines and Form, but you don’t want to 
apply this for the entire application. 
Try to make a new route which works similar to “/api/restaurants?page=1&perPage=5&borough=Bronx” 
and take the ‘page’, ‘perPage’ and ‘borough’ through FORM and display the output using Template 
Engine! 
Use your creativity to design the layout and apply proper css style/format. 

**Step 4 : Use Environment Variable for your Connection String:**
Your solution currently has your database connection string (with username and password!) hard coded 
into your source code. This is a potential security risk. If this code is shared between users on a team, 
or if it is pushed to a public repo on GitHub, your password is now public too. 

**Step 5 : Add security feature to the app:**
The app giving use the access to restaurant data. How do you limit the user-access, so that only 
authorized users can open the app or access to specific route? 
This is an open concept questions in which you can use the security features like Password Encryption, 
JWT, Session, Cookie that we have learned in the course in order to allow only authorized user to use 
some of the special routes! You may also think about “openweathermap” which needs appID/appKey.

