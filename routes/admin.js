var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");
var async = require("async");

router.use(mongo.user.restricted);

router.get("/reindex/authors", (req, res, next) => {
	req.apihelper.get("meta")
	.then(result => {
		var authors = {};
		meta.forEach(doc => {
			var name = doc.properties.author || doc.raw.Author || doc.raw.Creator || doc.raw["Initial-creator"] || null;
			if (!name)
				return;
			if (!authors[name])
				authors[name] = 0;
			authors[name]++;
		});
		console.log(authors);
		var queue = [];
		for (var name in authors) {
			queue.push(cb => {
				req.apihelper.post("author", { name, count: authors[name] })
				.then(result => {
					cb(null, result);
				})
				.catch(err => {
					cb(err);
				});
			});
		}
		async.series(queue, (err, result) => {
			if (err)
				return res.send(err);
			return result;
		});
		res.send(authors);
	});
});

module.exports = router;
