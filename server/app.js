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
  var reqData = {
        key: process.env.barchart_api_key, //ENV["barchart_api_key"],
        symbol: "GOOG", //data["symbol"],
        type: "daily", //data["type"],
        startDate: "20150308"
  };

  reqData.symbol = req.params.stock;

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

      res.type('.json');
      res.send(Buffer.concat(rawData).toString());
    });
  }).on("error", (err)=>{
    res.statusCode = 500;
    res.end();
  })

})

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('*', (req, res)=> {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
})

module.exports = app;
