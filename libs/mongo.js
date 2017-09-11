var APIHelper = require("./apihelper");
var rest = require('restler-bluebird');
var config = require("config");

var user = {
	restricted: (req, res, next) => {
		var apikey = req.session.apikey || null;
		var user = req.session.user || null;
		if (!apikey || !user)
			return res.redirect("/login");
		req.apihelper = new APIHelper({ apikey });
		req.apihelper.getOne("user", user._id)
		.then(result => {
			next();
		})
		.catch(err => {
			return res.redirect("/login");
		});
	},
	login: (req, res, next) => {
		console.log(config.root_api + "/login");
		rest.post(config.api_root + "/login", { data: { email: req.body.email, password: req.body.password } })
		.then(function(data) {
			req.session.apikey = data.apikey;
			req.session.user_id = data.user_id;
			return rest.get(config.api + "/user/" + data.user_id + "?autopopulate=true&apikey=" + data.apikey);
		})
		.then(function(user) {
			req.session.user = user;
			req.session.apikey = req.session.apikey;
			next();
		}, function(err) {
			console.trace(err);
			res.redirect("/login");
		});
	}
};

var meta = {
	count: (req, res, next) => {
		req.apihelper.get("meta", { limit: 1 })
		.then(result => {
			res.locals.count = result.count;
			next();
		})
		.catch(err => {
			console.log("Here");
			console.trace(err);
			res.send(err);
		});
	},
	search: (req, res, next) => {
		res.locals.params = req.query;
		if (req.query.dosearch) {
			var q = {
				limit: 50
			};
			if (req.query.pg)
				q["page"] = req.query.pg;
			if (req.query.filename)
				q["filter[filename]"] = "$regex:" + req.query.filename;
			req.apihelper.get("meta", q)
			.then(result => {
				console.log(result.data[0].raw);
				res.locals.searchResult = result;
				next();
			})
			.catch(err => {
				console.trace(err);
				res.send(err);
			});
		} else {
			next();	
		}
	}
};

module.exports = { meta, user };