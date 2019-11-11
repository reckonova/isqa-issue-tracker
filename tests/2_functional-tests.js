/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var _idTest;
suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      //change the tests so that it creates a unique entry modifies it then ultimately deletes it from db
      //check to to get a query object in the get method
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open, true);
          _idTest = res.body._id;
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title2',
          issue_text: 'text2',
          created_by: 'Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title2')
          assert.equal(res.body.issue_text, 'text2');
          assert.equal(res.body.created_by, 'Required fields filled in');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);          
          done();
        });
        
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'Required fields are missing');
          assert.isUndefined(res.body.issue_title)
          assert.isUndefined(res.body.issue_text);
          assert.isUndefined(res.body.created_by);
          assert.isUndefined(res.body.assigned_to);
          assert.isUndefined(res.body.assigned_to);
          assert.isUndefined(res.body.status_text);
          assert.isUndefined(res.body.open); 
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: _idTest
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.updateError, 'no updated field sent')
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: _idTest,
          issue_title: 'Goodbye'
        })
        .end(function(err, res){
          assert.equal(res.body.success, 'successfully updated');
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: _idTest,
          issue_title: 'Later',
          assigned_to: 'Later',
          open: false
        })
        .end(function(err, res){
          assert.equal(res.body.success, 'successfully updated');
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: true
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((ele, i) => {
            assert.property(ele, 'issue_title');
            assert.property(ele, 'issue_text');
            assert.property(ele, 'created_on');
            assert.property(ele, 'updated_on');
            assert.property(ele, 'created_by');
            assert.property(ele, 'assigned_to');
            assert.property(ele, 'open');
            assert.property(ele, 'status_text');
            assert.property(ele, '_id');                      
          });
          
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_text: "Hello",
          open: true
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((ele, i) => {
            assert.equal(ele.issue_text, 'Hello');
            assert.equal(ele.open, true);
            assert.property(ele, 'issue_title');
            assert.property(ele, 'issue_text');
            assert.property(ele, 'created_on');
            assert.property(ele, 'updated_on');
            assert.property(ele, 'created_by');
            assert.property(ele, 'assigned_to');
            assert.property(ele, 'open');
            assert.property(ele, 'status_text');
            assert.property(ele, '_id');
          });
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({
        })
        .end(function(err, res){
          assert.equal(res.body.error, '_id error');         
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: _idTest
        })
        .end(function(err, res){
          assert.equal(res.body.sucess, 'deleted '+ _idTest);
          done();
        });
      });
      
    });

});
