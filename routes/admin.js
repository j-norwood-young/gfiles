var express = require('express');
var router = express.Router();
var mongo = require("../libs/mongo");
var async = require("async");
var execFile = require("child_process").execFile;
var generator = require('generate-password');
var mail = require("../libs/mail");

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

router.get("/users/add", (req, res, next) => {
	res.render("users/add");
});

router.post("/users/add", (req, res) => {
	var email = req.body.email;
	var name = req.body.name;
	var password = generator.generate({
		length: 12,
		numbers: true
	});
	// res.send({ name, email, password });
	req.apihelper.post("user", { email, name, password })
	.then(result => {
		mail.send({
			to: email,
			from: "jason@10layer.com",
			subject: "Welcome to GuptaFiles",
			body: `Hi ${name},<br>
<br>
Welcome to the GuptaFiles, an online resource for exploring and interviewing the files associated to the Gupta Leaks.<br>
<br>
You can log in by going to <a href="https://guptafiles.sourcery.info">https://guptafiles.sourcery.info</a> and logging in with the following information:<br>
Email: ${ email }<br>
Password: ${ password }<br>
<br>
Please do not share your password with anyone. If you need to give someone else access, please contact Jason at jason@10layer.com.<br>
<br>
All of the Gupta files have been inspected for their metadata, which in some cases include author, editor, whether (and when) a file was printed, and even GPS data.<br>
<br>
Many of the files (particularly PDFs, XLSX, Doc and Docx) have had the text extracted, and that is searchable in the database.<br>
<br>
Full-text search tips:<br>
If you use a number of words, the system will do an OR search, eg <em>gupta bribe</em> would search gupta OR bribe.<br>
Use double quotes to search for a term, eg. <em>"Search this whole term"</em>.<br>
Use a minus sign to exclude a word, eg. <em>gupta -bribe</em> to exclude the word bribe.<br>
<br>
More features are planned, so check back often. We will note new features on the first page.<br>
<br>
Happy hunting!<br>
Jason`
		})
		res.render("users/add", { alert: { msg: "User added", status: "success" } } );
	})
	.catch(err => {
		console.error(err);
		res.render("users/add", { alert: { msg: err.message, status: "danger" } } );
	});
});

module.exports = router;
