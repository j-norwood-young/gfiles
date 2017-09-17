var config = require('config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport(config.smtp));

var send = function(mailObj) {
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailObj, function(err, info) {
			if (err) {
				console.error(err);
				return reject(err);
			}
			return resolve(info);
		});
	});
};

var mail = {
	send: function(params) {
		var mailObj = {
			from: params.from || config.smtp_from,
			to: params.to,
			subject: params.subject,
			html: params.body
		};
		return send(mailObj);
	},
};

module.exports = mail;