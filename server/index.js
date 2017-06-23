const app = require('./app');

app.listen(process.env.PORT || 3000, ()=> {
  console.log("I'm listening on localhost:3000");
});
