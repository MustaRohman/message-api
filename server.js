var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Message API root');
});

// ------------------- Messages --------------------

app.post('/messages', function(req, res) {
	var body = _.pick(req.body, 'text');

	db.message.create(body).then(function(message) {
		res.json(message.toJSON());
	}, function (e) {
		res.status(400).send();
	})
})


// ------------------- Login --------------------

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	})
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authenticate');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			console.log(typeof token);
			res.status(401).send();
		}
	}, function(e) {
		console.log('Authenticate method failed');
		res.status(401).send();
	})
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});