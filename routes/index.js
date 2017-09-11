var express = require('express');
var router = express.Router();
var mongo = require("../libs//mongo");

/* GET home page. */
router.get('/', mongo.user.restricted, mongo.meta.count, function(req, res, next) {
	res.render('index', { title: 'Gupta Files' });
});

router.use("/login", require("./login"));
router.use("/search", require("./search"));
router.use("/document", require("./document"));
router.use("/admin", require("./admin"));

module.exports = router;
