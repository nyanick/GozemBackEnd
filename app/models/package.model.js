const mongoose = require("mongoose");

const Package = mongoose.model(
  "Package",
  new mongoose.Schema({
    package_id: {type: String, required: true},
    active_delivery_id: String,
    description: {type: String, required: true},
    created_user: String,
    modified_user: String,
    weight: Number,
    width: Number,
    height: Number,
    depth: Number,
    from_name: {type: String, required: true},
    from_address: {type: String, required: true},
    from_location: {
      lat: {type: String, required: true},
      lng: {type: String, required: true},
    },
    to_name: {type: String, required: true},
    to_address: {type: String, required: true},
    to_location: {
      lat: {type: String, required: true},
      lng: {type: String, required: true},
    },
    deliveries: [
      {
        type: mongoose.Schema.Types.ObjectId,////arrays of delivery_id
        ref: "Delivery"
      }
    ]
  })
);


module.exports = Package;
