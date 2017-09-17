var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");
var async = require("async");

router.use(mongo.user.restricted);

var csvCheck = (document) => {
	if (!document.body)
		return Promise.resolve();
	console.log(document.ext);
	console.log((!(document.ext === "xls" || document.ext === "xlsx")));
	if ((document.ext !== ".xls" && document.ext !== ".xlsx")) {
		return Promise.resolve();
	}
	return new Promise((resolve, reject) => {
		var results = [];
		// Split the csv into sheets
		var sheets = document.body.split("\u0007");
		sheets.shift();
		sheets.forEach(sheet => {
			var result = {
				name: null,
				data: null
			};
			lines = sheet.split("\n");
			result.name = lines.shift().trim();
			result.data = lines.map(line => {
				return line.split("\t");
			});
			results.push(result);
		});
		resolve(results);
	});
}

router.get("/:_id", mongo.meta.search, (req, res, next) => {
	var document = null;
	req.apihelper.getOne("meta", req.params._id)
	.then(result => {
		document = result;
		return csvCheck(document);
	})
	.then(tables => {
		console.log(tables);
		res.render("document", { document, tables });
	});
});

module.exports = router;
