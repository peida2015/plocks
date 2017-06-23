"use strict";

const express = require('express');
const http = require('http');
const qstring = require('querystring');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();

const admin = require("firebase-admin");

var serviceAccount = require("./voltaic-tooling-115723-firebase-adminsdk-mu326-440c12fb16.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://voltaic-tooling-115723.firebaseio.com"
});

const db = admin.database();

app.use(bodyParser.json());

var verifyIdToken = (req, res, next)=> {

  let token = req.body.accessToken;

  function unauthorizedAccess() {
    res.statusCode = 403;
    res.end();
  }

  if (!token) {
    unauthorizedAccess();
  } else {
    admin.auth().verifyIdToken(token)
    .then(function (decodedToken) {
      console.log(decodedToken.uid);
      next()
    })
    .catch(function (error) {
      console.log(error);
      unauthorizedAccess();
    })
  }

}

app.use('/stockdata/:stock', verifyIdToken);

app.post('/stockdata/:stock', function (req, res) {
  var symbol = req.params.stock;
  var ref = db.ref('/stockdata/'+symbol);

  function reqBarchartData() {
    var reqData = {
      key: process.env.barchart_api_key, //ENV["barchart_api_key"],
      symbol: "GOOG",
      type: "daily",
      startDate: "20150308"
    };

    reqData.symbol = symbol;

    var options = {
      hostname: "marketdata.websol.barchart.com",
      path: "/getHistory.json?"+qstring.stringify(reqData),
      headers: {
        "Content-type": 'application/x-www-form-urlencoded'
      },
      method: "GET"
    }

    http.get(options, (response)=> {
      var rawData = [];

      console.log("got something");

      // Handle error
      response.on("error", (err)=>{
        res.statusCode = 500;
        res.end();
      });

      // Aggregate data
      response.on('data', (chunk) => {
        rawData.push(chunk);
      });

      // pass on data when done
      response.on('end', ()=> {
        console.log("end");
        var data = Buffer.concat(rawData).toString();
        var response = JSON.parse(data);

        if (response.status.code === 200) {
          ref.set({
            timestamp: Date.now(),
            data: data
          });
          res.type('.json');
          res.send(data);
        } else if (snapshot.val()){
          // return old data if fresh data request is not successful
          res.type('.json');
          res.send(snapshot.val().data);
        } else {
          // if no data is available, return 500
          res.statusCode = 500;
          res.end();
        }
      })
    }).on("error", (err)=>{
      res.statusCode = 500;
      res.end();
    });
  };


  ref.once("value").then(function (snapshot){
    var oneDay = 60 * 60 * 24 * 1000;
    console.log(Date.now() - snapshot.val().timestamp);

    if (!snapshot.val() || Date.now() - snapshot.val().timestamp > oneDay) {
      // if there's no fresh data in firebase db, request new and store
      reqBarchartData();
    } else {
      console.log("sent from fb");
      res.type(".json");
      res.send(snapshot.val().data);
    }

  }).catch(function (error) {
    reqBarchartData();
  });
});


app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('*', (req, res)=> {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
})

module.exports = app;
