const express = require("express");
const app = express();
var path = require('path');
app.use(express.static('public'));
const PORT = process.env.PORT || 8080;

let dummyData = {
    "1234": "http://google.com",
    "0123": "http://bing.com"
};

// **** connect to Mongo DB **** 
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/learning';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
    console.log("Connected correctly to mongoDB");
    var redirectSchema = mongoose.Schema({
        name: String,
        url: String
    });
    var Redirect = mongoose.model('Redirect', redirectSchema);

        
    // **** ROUTES ****

    app.get("/", function(req, res){
        res.sendFile(path.join(__dirname, "public/index.html"));
    });

    app.get("/new/*?", function(req, res){
        // get a random 4 digit number to serve as the alias
        let alias = getAlias();
        if (checkURL(req.params[0])){
            const newAlias = new Redirect({ name: alias, url: req.params[0]});
            newAlias.save(function (err, newRedirect) {
                if (err) return console.error(err);
                res.send("Redirect created successfully: " + alias);
            });
        } else {
            res.send("that is not a valid URL.");
        }
    });

    app.get("/:urlAlias", function(req, res){
        // make sure url exists in datapase
        if (dummyData.hasOwnProperty(req.params["urlAlias"])){
            // perform redirect
            res.redirect(dummyData[req.params["urlAlias"]]);
        } else {
            res.send("url not found: " + req.params["urlAlias"]);
        }
    });


    // **** START THE SERVER ****

    app.listen(PORT, function(){
        console.log("Server is running on port " + PORT);
    });
});

// **** Helper functions ****

function randomNum(){
    //returns a string containing a digit 0-9
    return Math.floor(Math.random()*10).toString();
}

function getAlias(tries){
    // returns a random 4-digit strings
    const alias = randomNum() + randomNum() + randomNum() + randomNum();
    if (checkAlias(alias)){
        return alias;
    } else {
        if (tries > 9990){
            // stop recursion if all possible aliases are in use
            return false;
        } else {
            // try again for an alias that's not in use
            getAlias(tries+1);
        }
    }
}

function checkAlias(testAlias){
    // returns whether or not this alias is available for use
    // gets this index from the db, returns true if there's a string there, false if not
    return true;
}

function checkURL(url){
    urlOK = true;
    var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    var regex = new RegExp(expression);

    if (url.match(regex)) {
        return true;
    } else {
        return false;
    }
}