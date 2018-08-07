/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION = "mongodb://" + process.env.USER +":" + process.env.KEY + "@" + process.env.HOST + "/" + process.env.DATABASE;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      console.log("GETTING")
      var project = req.params.project;
      let query = req.query;
      if (query._id){
        query._id = ObjectId(query._id);
      }
      if (query.open){
        (query.open == "true") ? query.open = true : query.open = false;
      }
      MongoClient.connect(CONNECTION, function(err, data){
        data.collection(project).find(query).toArray(function(err,docs){res.json(docs)})
      });
    })
    
    .post(function (req, res){
      console.log("POSTING")
      var project = req.params.project;
      let info = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        status_text: req.body.status_text,
        assigned_to: req.body.assigned_to,
        open: true,
        created_on: new Date(),
        updated_on: new Date(),
      }
      if (!info.issue_title || !info.issue_text || !info.created_by){
        res.send("Necessary information is missing.")
      } else {
        MongoClient.connect(CONNECTION, function(err, data){
          data.collection(project).insertOne(info, function(err, issue){
            info._id = issue.insertedId;
            res.json(info);
          })
        })
      }
    })
    
    .put(function (req, res){
      console.log("PUTTING")
      var project = req.params.project;
      let id = new ObjectId(req.body._id);
      delete req.body._id; 
      let info = req.body;
      for (let i in info){
        if (!info[i]){
          delete info[i];
        }
      }
      if (info.open){
        (info.open == "true") ? info.open = true : info["open"] = false;
      }
      if (Object.keys(info).length < 1){
        res.send("no updated field sent");
      } else {
        info.updated_on = new Date();
        MongoClient.connect(CONNECTION, function(err, data){
          if (err){
            res.send('could not update '+id)
          } else {
            data.collection(project).findAndModify({_id: id}, [['_id',1]], {$set: info},{new: true}, function(error, item){
              (!err) ? res.send('successfully updated') : res.send('could not update '+id);
            })
          }
        })
      }
    })
    
    .delete(function (req, res){
      console.log("DELETING")
      var project = req.params.project;
      let id = req.body._id;
      if (!id){
        res.send("_id error");
      } else {
        MongoClient.connect(CONNECTION, function(err, data){
          if (err){
            res.send('could not delete '+ id)
          } else {
            data.collection(project).findAndRemove({_id:new ObjectId(id)}, function(error, item){
            (!err) ? res.send('deleted '+id) : res.send('could not delete '+id);})
          }
          
        });
      }
    });
    
};
