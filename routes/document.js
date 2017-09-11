var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");

router.use(mongo.user.restricted);

router.get("/:_id", mongo.meta.search, (req, res, next) => {
	req.apihelper.getOne("meta", req.params._id)
	.then(result => {
		res.send(result);
	});
});

module.exports = router;
