const db = require("../models");
var uuid = require('uuid');
const mongoose = require("mongoose");


const Delivery = db.delivery;
const Package = db.package;
const Role = db.role;


exports.getAllDeliveries = (req, res) => {
  Delivery.find({}).sort({ _id: -1 }).limit(100).exec(function (err, result) {

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

exports.getOneDelivery = (req, res) => {
  const id = req.params.id;
  if(mongoose.Types.ObjectId.isValid(id) ){
    //user the object ID == _id
    Delivery.findOne({'_id':id},function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send(result);
    })

  }
  else{
    //user our custom deliveryId generated by the system
    Delivery.findOne({'delivery_id':id},function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send(result);
    })

  }

  /*
  Delivery.find( { $or:[ {'_id':id}, {'delivery_id':id} ]},function (err, result) {

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

exports.deleteDelivery = (req, res) =>{
  const id = req.params.id;

  Delivery.findOne({_id: id}, function (err, result) {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if(!result){
        res.status(404).send({ message: "Incorrect ID, Element not found" });
        return;
      }

      /*
      i would remove the deliver_id from the root parent package data
      */
      Package.findOne({'package_id':result.package_id},function (err, package) {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if(!package){
          res.status(404).send({ message: "Incorrect ID, package not found" });
          return;
        }
        const index = package.deliveries.indexOf(id);
        if(index > -1){
          package.deliveries.splice(index);
        }
        
        if(package.active_delivery_id === id){
          package.active_delivery_id = null;
        }


        package.save((err, package) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          /*package was successfully updated, now we can delete the delivery item */

          Delivery.findByIdAndRemove({_id: id}, function (err, result) {

          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.status(200).send({message: "Successfully Deleted"});

          });
        
      });
      
    });
  });

}

exports.createDelivery = (req, res) =>{

  if (!req.body) {
    return res.status(400).send({
      message: "Data to create can not be empty!"
    });
  }

  const delivery = new Delivery({
    delivery_id: uuid.v4(),
    package_id: req.body.package_id,
    pickup_time: null,
    start_time: null,
    end_time: null,
    location: req.body.location,
    status: req.body.status,
    created_user:req.userId
  });
  
  /*
  check validated the package_id and control that it does exist
  */
  Package.find({'package_id':req.body.package_id},function (err, result) {

    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if(!result){
      res.status(404).send({ message: "Invalid package ID" });
    }

    delivery.save((err, delivery) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      /*
      we would updated the Package document to map the relationship
      */

      Package.findOne({'package_id':req.body.package_id},function (err, package) {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!package) {
          Delivery.findByIdAndRemove({_id:delivery._id}, function (err2, data) {
            if (err2) {
              console.log("Did not delete the delivery element");
            }
          });
          res.status(500).send({ message: err });
          return;
        }

        package.active_delivery_id = delivery.delivery_id;
        
        package.deliveries.push(delivery._id);

        console.log(package);
        package.save((err, result) => {
          if (err) {
            /*
            we would delete the already created delivery since an error occurred
            */

            Delivery.findByIdAndRemove({_id:delivery._id}, function (err2, data) {
              if (err2) {
                console.log("Did not delete the delivery element : "+err2);
                res.status(500).send({ error: err2});
                return;
              }
            });

            res.status(500).send({ error: err});
            return;
          }

          res.send({ message: "Delivery was created successfully!", delivery: delivery });

        });
      });

    });

  });

}
  

exports.updateDelivery = (req, res) =>{

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;


  Delivery.findOne({_id: id}, function (err, result) {

    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if(!result){
      res.status(404).send({ message: "Incorrect ID, Element not found" });
      return;
    }

    result.delivery_id = result.delivery_id; //delivery ID can not be modified
    result.pickup_time= req.body.pickup_time;
    result.start_time= req.body.start_time;
    result.end_time= req.body.end_time;
    result.location= req.body.location;
    result.status = req.body.status;
    result.created_user = req.body.created_user;
    result.modified_user = req.userId;

    /*
    we would check if the package Id was modified, inorder to under the parent package element
    */
   if(result.package_id === req.body.package_id){
      result.package_id = req.body.package_id;
      result.save((err, delivery) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "Delivery was updated successfully!" , delivery:delivery});

      });

   }
   else{
     
     //first case, we remove this delivery from the package and later insert the delivery in the new package
     /*
      i would remove the deliver_id from the root parent package data
      */
      Package.findOne({'package_id':result.package_id},function (err, package) {

        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        const index = package.deliveries.indexOf(id);
        if(index > -1){
          package.deliveries.splice(index);
        }

        if(package.active_delivery_id === result.delivery_id){
          package.active_delivery_id = null;;
        }

        package.save((err, pack) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          /*package was successfully updated, now we can insert this delivery into it's new package */

          Package.findOne({'package_id':req.body.package_id},function (err, package2) {

          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          package2.active_delivery_id = result.delivery_id;
          package2.deliveries.push(result._id);
          package2.save((err, data) => {
            if (err) {

              res.status(500).send({ error: err});
              return;
            }

            /*
            Now we freely updated the delivery element
            */
            result.package_id = req.body.package_id;
            result.save((err, delivery) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "Delivery was updated successfully!" , delivery:delivery});

          });
        });
        
        });

      });
    
      });
    }
  });
}