var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");

router.get("/", mongo.user.logout, (req, res, next) => {
	res.render("login");
});

router.post("/", mongo.user.login, (req, res, next) => {
	res.redirect("/");
});

module.exports = router;
