const db = require("../models");
var uuid = require('uuid');
const mongoose = require("mongoose");


const Package = db.package;
const Delivery = db.delivery;
const Role = db.role;


exports.getAllPackages = (req, res) => {
  Package.find({}).sort({ _id: -1 }).limit(100).exec(function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      /*

      for(let i = 0; i<result.length;i++){
        if(result[i].active_delivery_id){
          //find the active delivery data and load it
          Delivery.findOne({delivery_id: result[i].active_delivery_id}, function (err, element) {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            result[i].active_delivery_id = element;
          });
        }

        Delivery.find({_id: { $in: result[i].deliveries },},(err, elements) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          result[i].deliveries = elements;
        });

      }
      */

      res.status(200).send(result);
    })
}


exports.getOnePackage = (req, res) => {
  const id = req.params.id;
  if(mongoose.Types.ObjectId.isValid(id) ){
    //user the object ID == _id
    Package.find({'_id':id},function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send(result);
    })

  }
  else{
    //user our custom packageId generated by the system
    Package.find({'package_id':id},function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send(result);
    })

  }

  /*
  Package.find( { $or:[ {'_id':id}, {'package_id':id} ]},function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      
      if(result.active_delivery_id){
        //find the active delivery data and load it
        Delivery.findOne({delivery_id: result.active_delivery_id}, function (err, element) {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          result.active_delivery_id = element;
        });
      }

      Delivery.find({_id: { $in: result.deliveries }},(err, elements) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        result.deliveries = elements;
      });
      
      res.status(200).send(result);
    })
    */
}

exports.deletePackage = (req, res) =>{
  const id = req.params.id;

  Package.findOne({_id: id}, function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if(!result){
        res.status(404).send({ message: "Incorrect ID, Element not found" });
        return;
      }

      Delivery.deleteMany({_id: { $in: result.deliveries }},(err, elements) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        /*
        Now we would delete the many parent object itself
        */
        Package.findByIdAndRemove({_id: id}, function (err, result) {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.status(200).send({message: "Successfully Deleted"});

      });

      
    });

  });

}

exports.createPackage = (req, res) =>{

  const package = new Package({
    package_id: uuid.v4(),
    active_delivery_id: null,
    description: req.body.description,
    created_user: req.userId,
    weight: req.body.weight,
    width: req.body.width,
    height: req.body.height,
    depth: req.body.depth,
    from_name: req.body.from_name,
    from_address: req.body.from_address,
    to_name: req.body.to_name,
    to_address: req.body.to_address,
    to_location: req.body.to_location,
    from_location: req.body.from_location,
    deliveries: []
  });

  package.save((err, package) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.send({ message: "Package was registered successfully!" , package:package});

  });
  


}

exports.updatePackage = (req, res) =>{

  console.log(req.body);

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;


  Package.findOne({_id: id}, function (err, result) {

    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if(!result){
      res.status(404).send({ message: "Incorrect ID, Element not found" });
      return;
    }

    result.active_delivery_id= req.body.active_delivery_id
    result.description= req.body.description,
    result.created_user = result.created_user;
    result.modified_user = req.userId;
    result.weight = req.body.weight;
    result.width= req.body.width;
    result.height= req.body.height;
    result.depth= req.body.depth;
    result.from_name= req.body.from_name;
    result.from_address= req.body.from_address;
    result.to_name= req.body.to_name;
    result.to_address= req.body.to_address;
    result.to_location= req.body.to_location;
    result.from_location= req.body.from_location;
    result.deliveries= req.body.deliveries;

    /*
    if active delivery was change, we need to make sure 
    the Id is contain within the deliveries arrays
    ............future work
    */

    result.save((err, package) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      res.send({ message: "Package was updated successfully!" , package:package});

    });
  })
 
}
