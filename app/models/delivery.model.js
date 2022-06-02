const mongoose = require("mongoose");

const Delivery = mongoose.model(
  "Delivery",
  new mongoose.Schema({
    delivery_id:{type: String, required: true},
    package_id: {type: String, required: true},
    pickup_time : { type: Date/*, required: true, default: Date.now */},
    start_time : { type: Date/*, required: true, default: Date.now */},
    end_time : { type: Date/*, required: true, default: Date.now*/ },
    location: {
      lat: {type: String, required: true},
      lng: {type: String, required: true}
    },
    status: {
        type: String,
        enum : ['open','picked-up','in-transit','delivered','failed'],
        default: 'open'
    },
    created_user: String,
    modified_user: String,
  })
);


module.exports = Delivery;
