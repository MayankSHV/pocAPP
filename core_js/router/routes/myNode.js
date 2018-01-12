/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");

module.exports = function() {
	var app = express.Router();

	//Hello Router
	app.get("/", function(req, res) {
		res.send("Hello World Node.js");
	});

	//Simple Database Select - In-line Callbacks
	//Example1 handler
	app.get("/example1", function(req, res) {
		var client = req.db;
		client.prepare(
			"select SESSION_USER from \"DUMMY\" ",
			function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function(err, results) {
						if (err) {
							res.type("text/plain").status(500).send("ERROR: " + err.toString());
							return;

						} else {
							client.exec("insert into \"POCAPP_00_1\".\"log.logs\" values (1000000001,\"1\",\"2\",\"3\")", function(err, affectedRows) {
								if (err) {
									res.type("text/plain");
									res.send("Status : Fail </br> errorCode : 500 </br> errorText : " + err.toString());
									return; //rollback
								} else {
									var result = JSON.stringify({
										Objects: results
									});

									res.type("application/json").status(200).send(affectedRows);
								}

							});
						}
					});
			});
	});

	app.get("/GetPO", function(req, res) {
		//var pid = req.params.POId;
		var Poid = req.query.POId;

		var client = req.db;
		var Query = "";

		if (typeof Poid === "undefined" || Poid === null) {
			res.type("application/json").status(500);
			res.send(JSON.stringify({ "Status" : "Fail", "errorCode" : 500 , "errorText" : "Invalid Purchase Order" }));
			return;
		}
		else if (isNaN(Poid))
		{
		    res.type("application/json").status(500);
			res.send(JSON.stringify({ "Status" : "Fail", "errorCode" : 500 , "errorText" : "POId is Invalid" }));
			return;
		}
		else if (Poid === "") {
			//	res.type("text/plain").status(500).send("ERROR: Invalid Purchase Order ID Blank ");
			Query = "SELECT TOP 10	PURCHASEORDERID,NOTEID,GROSSAMOUNT,NETAMOUNT,CONFIRMSTATUS	FROM \"POCAPP_00_1\".\"PO.Header\"";
		} else {
			Query = "SELECT TOP 10	PURCHASEORDERID,NOTEID,GROSSAMOUNT,NETAMOUNT,CONFIRMSTATUS	FROM \"POCAPP_00_1\".\"PO.Header\"" +
				" WHERE PURCHASEORDERID = " + Poid;
		}

		client.prepare(Query,
			function(err, statement) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				}
				statement.exec([],
					function(err, results) {
						if (err) {
							res.type("text/plain").status(500).send("ERROR: " + err.toString());
							return;

						} else {
							var result = JSON.stringify({
								Objects: results
							});
							client.exec("insert into \"POCAPP_00_1\".\"log.logs\" (\"req\",\"key\",\"response\") values ('1','2','" + result + "')", function(err,
								affectedRows) {
								if (err) {
									res.type("text/plain").status(500).send("ERROR: " + err.toString());
									return; //rollback
								} else {

									res.type("application/json").status(200).send(result);
								}

							});
						}
					});
			});
	});

	var async = require("async");
	//Simple Database Select - Async Waterfall
	app.get("/example2", function(req, res) {
		var client = req.db;
		async.waterfall([

			function prepare(callback) {
				client.prepare("select SESSION_USER from \"DUMMY\" ",
					function(err, statement) {
						callback(null, err, statement);
					});
			},

			function execute(err, statement, callback) {
				statement.exec([], function(execErr, results) {
					callback(null, execErr, results);
				});
			},
			function response(err, results, callback) {
				if (err) {
					res.type("text/plain").status(500).send("ERROR: " + err.toString());
					return;
				} else {
					var result = JSON.stringify({
						Objects: results
					});
					res.type("application/json").status(200).send(result);
				}
				callback();
			}
		]);
	});

	//Simple Database Select - Async Waterfall

	app.route("/dummy2:")
		.get(function(req, res) {
			var client = req.db;
			async.waterfall([
				function prepare(callback) {
					client.prepare("select SESSION_USER from \"DUMMY\" ",
						function(err, statement) {
							callback(null, err, statement);
						});
				},

				function execute(err, statement, callback) {
					statement.exec([], function(execErr, results) {
						callback(null, execErr, results);
					});
				},
				function response(err, results, callback) {
					if (err) {
						res.type("text/plain").status(500).send("ERROR: " + err);
					} else {
						var result = JSON.stringify({
							Objects: results
						});
						res.type("application/json").status(200).send(result);
					}
					callback();
				}
			]);
		});

	return app;
};