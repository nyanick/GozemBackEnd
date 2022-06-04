const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const app = express();


dotenv.config();

var corsOptions = {
  //origin: "https://phenomenal-taiyaki-148579.netlify.app"
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "gozem-session",
    secret: process.env.COOKIE_SECRET,
    httpOnly: true
  })
);

const db = require("./app/models");
const Role = db.role;
const Delivery = db.delivery;

console.log(process.env.MONGODB_URL);
db.mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ data: "Welcome to Package Tracker Gozem App." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/package.routes")(app);
require("./app/routes/delivery.routes")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server  = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "driver"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'Driver' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });

}

//const io = require('socket.io')(server);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});


//web sockets

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });


  //joining the delivery update crew to await broadcast
  socket.on("delivery_updated", (delivery_id) => {
    console.log("delivery_updated: " + delivery_id);
    socket.join(delivery_id);
  });

  //broadcast to notify update of events
  socket.on("status_changed", ({data,room }) => {

    console.log("yann see this here");

    console.log(data);
    console.log(room);
    const myArray = data.split(",");
    
    var delivery_id = myArray[0];
    var status = myArray[1];

    console.log("status_changed: " + status + " with id : " + delivery_id);

    /*
    update the status and come do the broadcast
    */
   Delivery.findOne({_id: delivery_id}, function (err, result) {

    if (err) {
      console.log(err);
      return;
    }
    
    //new Date().toISOString().slice(0,10);
    if(status === "pickedup" ){
      result.pickup_time= new Date();
    }
    else if(status === "failed" ){
      result.end_time= new Date();
    }
    else if(status === "delivered" ){
      result.end_time= new Date();
    }
    else{
      //In-transit
      result.start_time= new Date();
    }
    result.status = status;

    result.save((err, delivery) => {
      if (err) {
        console.log(err);
        return;
      }

      io.emit("delivery_updated", JSON.stringify(delivery));

      //res.send({ message: "Delivery was updated successfully!" , delivery:delivery});

    });


  });

   
    //io.emit("delivery_updated", data);
    //io.to(delivery_id).emit("delivery_updated", data);
    // send to all including sender
  });

  socket.on("location_changed", ({data,room }) => {

    console.log("Location change .....");
    console.log(data);
    console.log(room);

    const myArray = data.split(",");
    
    var delivery_id = myArray[0];
    var lat = myArray[1];
    var long = myArray[2];
    

    console.log("location_changed: " + lat+" , " +long + " with id : " + delivery_id);
    /*
    We would update this delivery item and call the location broadcasr
    */
    Delivery.findOne({_id: delivery_id}, function (err, result) {

    if (err) {
      console.log(err);
      return;
    }
    
    result.location.lat = lat;
    result.location.lng = long;

    result.save((err, delivery) => {
      if (err) {
        console.log(err);
        return;
      }

      io.emit("delivery_updated", JSON.stringify(delivery));

      //res.send({ message: "Delivery was updated successfully!" , delivery:delivery});

    });


  });
   
    //io.to(delivery_id).emit("delivery_updated", location);
  });

});


