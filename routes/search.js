var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");

router.use(mongo.user.restricted);

router.get("/", mongo.meta.search, (req, res, next) => {
	var qs = req.query;
	if (qs.pg)
		delete qs.pg;
	var parts = [];
	for (var i in qs)
		parts.push(`${i}=${qs[i]}`);
	var base = `?${ parts.join("&")}&pg=`;
	res.render("search", { base });
});

module.exports = router;
