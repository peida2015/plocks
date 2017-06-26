const app = require('./app');

let port = process.env.PORT || 3000;
console.log(port);

app.listen(port, ()=> {
  console.log("I'm listening on localhost:3000");
});
