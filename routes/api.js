"use strict";

const expect = require("chai").expect;
const mongoose = require("mongoose");
const MongoClient = require("mongodb");
const queryString = require("query-string");
const ObjectId = require("mongodb").ObjectID;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }, 
                 (err, db) => {
  if (err) console.log(err);
});

var Schema = mongoose.Schema;

var issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  created_on: String,
  updated_on: String,
  open: Boolean
});

var Issue = mongoose.model("Issue", issueSchema);

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get((req, res) => {
      var project = req.params.project;
      var query = req.query;

      Issue.find(query, function(err, data) {
        res.send(data);
      });
    })

    .post((req, res) => {
      var project = req.params.project;
      var data = req.body;

      var postData = JSON.parse(JSON.stringify(data));
      if (
        !postData.issue_title ||
        !postData.issue_text ||
        !postData.created_by
      ) {
        res.json({ error: "Required fields are missing" });
        return;
      }
      if (!postData.assigned_to) {
        postData.assigned_to = "";
      }
      if (!postData.status_text) {
        postData.status_text = "";
      }
      var postData = Object.assign(postData, {
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        open: true
      });
      var newIssue = new Issue(postData);
      newIssue.save((error, data) => {
        if (error) console.log(error);
        var jsonData = {
          _id: data._id,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_by: data.created_by,
          assigned_to: data.assigned_to,
          status_text: data.status_text,
          created_on: data.created_on,
          updated_on: data.updated_on,
          open: data.open
        };

        res.json(jsonData);
      });
    })

    .put((req, res) => {
      var project = req.params.project;
      var data = req.body;
      var updateData = JSON.parse(JSON.stringify(data));

      if (Object.keys(data).length == 1) {
        res.json({ updateError: "no updated field sent" });
        return;
      }

      // removes empty fields and those just filled with spaces
      for (let property in updateData) {
        if (updateData[property] == "" || /^\s+$/.test(updateData[property])) {
          delete updateData[property];
        }
      }

      updateData.updated_on = new Date().toUTCString();

      Issue.findOneAndUpdate(
        { _id: updateData._id },
        { $set: updateData },
        { new: true },
        function(error, data) {
          if (error) {
            res.json({ failure: "could not update " + data._id });
            return;
          }

          res.json({ success: "successfully updated" });
        }
      );
    })

    .delete((req, res) => {
      var project = req.params.project;
      var idDelete = req.body._id;

      //checks to see if a parameter was passed or only spaces was given
      if (!idDelete || /^\s+$/.test(idDelete)) {
        res.json({ error: "_id error" });
        return;
      }

      Issue.findById({ _id: idDelete }, function(err, data) {
        if (err) {
          res.json({ error: "_id error" });
          return;
        }
        //check to see if id exists if it does delete it
        if (!data) {
          res.json({ error: "_id error" });
          return;
        }

        //deleting entry by id
        Issue.findByIdAndRemove({ _id: idDelete }, function(err, data) {
          if (err) console.log(err);

          //checks to see if it exists after deleting it

          Issue.findById({ _id: idDelete }, function(err, data) {
            if (err) console.log(err);

            if (data) {
              res.json({ failed: "could not delete " + idDelete });
            } else {
              res.json({ sucess: "deleted " + idDelete });
            }
          });
        });
      });
    });
};
