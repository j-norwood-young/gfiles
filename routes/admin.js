var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");
var async = require("async");
var execFile = require("child_process").execFile;

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

router.get("/index/doc", (req, res, next) => {
	req.apihelper.get("meta", { "filter[ext]": ".doc" })
	.then(result => {
		var queue = result.data.filter(file => !file.body).map(file => {
			return cb => {
				execFile("textutil", ["-convert", "txt", "-stdout", file.filename], (err, stdout, stderr) => {
					console.log(file.filename);
					if (err)
						return cb(err);
					req.apihelper.put("meta", file._id, { body: stdout })
					.then(result => {
						return cb(null, stdout);	
					})
					.catch(err => {
						return cb(err);
					});
				});
			}
		});
		async.series(queue, (err, result) => {
			if (err) {
				console.error(err);
				return res.send(err);
			}
			return res.send(result);
		});
	})
	.catch(err => {
		res.send(err)
	});
});

router.get("/index/docx", (req, res, next) => {
	req.apihelper.get("meta", { "filter[ext]": ".docx" })
	.then(result => {
		var queue = result.data.filter(file => !file.body).map(file => {
			return cb => {
				execFile("textutil", ["-convert", "txt", "-stdout", file.filename], (err, stdout, stderr) => {
					console.log(file.filename);
					if (err)
						return cb(null, err);
					req.apihelper.put("meta", file._id, { body: stdout })
					.then(result => {
						return cb(null, stdout);	
					})
					.catch(err => {
						return cb(err);
					});
				});
			}
		});
		async.series(queue, (err, result) => {
			if (err) {
				console.error(err);
				return res.send(err);
			}
			return res.send(result);
		});
	})
	.catch(err => {
		res.send(err)
	});
});

router.get("/index/pdf", (req, res, next) => {
	req.apihelper.get("meta", { "filter[ext]": ".pdf" })
	.then(result => {
		var queue = result.data.filter(file => !file.body).map(file => {
			return cb => {
				execFile("pdftotext", ["-layout", file.filename, "/dev/stdout"], (err, stdout, stderr) => {
					console.log(file.filename);
					if (err)
						return cb(null, err);
					if (!stdout)
						return cb(null);
					req.apihelper.put("meta", file._id, { body: stdout })
					.then(result => {
						return cb(null, stdout);
					})
					.catch(err => {
						return cb(err);
					});
				});
			}
		});
		async.series(queue, (err, result) => {
			if (err) {
				console.error(err);
				return res.send(err);
			}
			return res.send(result);
		});
	})
	.catch(err => {
		res.send(err)
	});
});

router.get("/index/xlsx", (req, res, next) => {
	req.apihelper.get("meta", { "filter[ext]": ".xlsx" })
	.then(result => {
		var queue = result.data.filter(file => !file.body).map(file => {
			return cb => {
				execFile("xlsx2csv", ["--all", "-p", "x07", "-d", "tab", file.filename], (err, stdout, stderr) => {
					console.log(file.filename);
					// console.log(stderr);
					if (err)
						return cb(null, err);
					if (!stdout)
						return cb(null);
					req.apihelper.put("meta", file._id, { body: stdout })
					.then(result => {
						return cb(null, stdout);
					})
					.catch(err => {
						return cb(err);
					});
				});
			}
		});
		async.series(queue, (err, result) => {
			if (err) {
				console.error(err);
				return res.send(err);
			}
			return res.send(result);
		});
	})
	.catch(err => {
		res.send(err)
	});
});
module.exports = router;
